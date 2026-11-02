import crypto from "crypto";

const OTP_SECRET = process.env.OTP_SECRET;

if (!OTP_SECRET) {
  throw new Error("OTP_SECRET is missing from server/.env");
}

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(code) {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(String(code))
    .digest("hex");
}

export function compareOtp(code, storedHash) {
  const submittedHash = Buffer.from(hashOtp(code), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");

  return (
    submittedHash.length === expectedHash.length &&
    crypto.timingSafeEqual(submittedHash, expectedHash)
  );
}
