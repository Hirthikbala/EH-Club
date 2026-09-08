import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, 12);
}

export async function verifyOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}
