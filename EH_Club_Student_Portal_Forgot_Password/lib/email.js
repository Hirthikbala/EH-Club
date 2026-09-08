import nodemailer from "nodemailer";

export async function sendOtpEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Electronics Hardware Club - Password Reset OTP",
    text: `Your Electronics Hardware Club password reset OTP is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
        <h2>Electronics Hardware Club</h2>
        <p>Your password reset code is:</p>
        <div style="font-size:32px;font-weight:800;letter-spacing:8px">${otp}</div>
        <p>This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `
  });
}
