import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { generateOtp, hashOtp } from "../../../lib/otp";
import { sendOtpEmail } from "../../../lib/email";

export async function POST(request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const db = getDb();
    const [rows] = await db.execute(
      "SELECT id FROM students WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    // Do not reveal whether an email is registered.
    if (!rows.length) {
      return NextResponse.json({
        message: "If this email is registered, a 6-digit reset code has been sent."
      });
    }

    const studentId = rows[0].id;

    await db.execute(
      "DELETE FROM password_reset_otps WHERE student_id = ?",
      [studentId]
    );

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const minutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);

    await db.execute(
      `INSERT INTO password_reset_otps
       (student_id, otp_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [studentId, otpHash, minutes]
    );

    await sendOtpEmail(normalizedEmail, otp);

    return NextResponse.json({
      message: "If this email is registered, a 6-digit reset code has been sent."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to send reset code." }, { status: 500 });
  }
}
