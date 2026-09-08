import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "../../../lib/db";
import { verifyOtp } from "../../../lib/otp";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !/^\d{6}$/.test(String(otp || ""))) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    const db = getDb();
    const [rows] = await db.execute(
      `SELECT r.id, r.otp_hash, r.expires_at, r.attempts, s.id AS student_id
       FROM password_reset_otps r
       JOIN students s ON s.id = r.student_id
       WHERE s.email = ?
       ORDER BY r.id DESC
       LIMIT 1`,
      [normalizedEmail]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    const record = rows[0];

    if (new Date(record.expires_at).getTime() < Date.now()) {
      await db.execute("DELETE FROM password_reset_otps WHERE id = ?", [record.id]);
      return NextResponse.json({ error: "OTP has expired. Request a new code." }, { status: 400 });
    }

    if (record.attempts >= 5) {
      await db.execute("DELETE FROM password_reset_otps WHERE id = ?", [record.id]);
      return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
    }

    const valid = await verifyOtp(String(otp), record.otp_hash);

    if (!valid) {
      await db.execute(
        "UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ?",
        [record.id]
      );
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    // Short-lived server-side reset token stored as a hash.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    await db.execute(
      `UPDATE password_reset_otps
       SET otp_hash = ?, expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
       WHERE id = ?`,
      [resetTokenHash, record.id]
    );

    return NextResponse.json({ resetToken });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to verify OTP." }, { status: 500 });
  }
}
