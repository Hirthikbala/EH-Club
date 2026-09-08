import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "../../../lib/db";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || String(token).length < 32) {
      return NextResponse.json({ error: "Invalid reset session." }, { status: 400 });
    }

    if (!password || String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
    const db = getDb();

    const [rows] = await db.execute(
      `SELECT id, student_id, expires_at
       FROM password_reset_otps
       WHERE otp_hash = ?
       LIMIT 1`,
      [tokenHash]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Invalid or expired reset session." }, { status: 400 });
    }

    const record = rows[0];

    if (new Date(record.expires_at).getTime() < Date.now()) {
      await db.execute("DELETE FROM password_reset_otps WHERE id = ?", [record.id]);
      return NextResponse.json({ error: "Reset session expired. Start again." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    await db.execute(
      "UPDATE students SET password_hash = ? WHERE id = ?",
      [passwordHash, record.student_id]
    );

    await db.execute(
      "DELETE FROM password_reset_otps WHERE id = ?",
      [record.id]
    );

    return NextResponse.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
  }
}
