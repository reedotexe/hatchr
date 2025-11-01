// utils/otpHelper.js

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOTPExpiryTime = (minutesValid = 10) => {
  return new Date(Date.now() + minutesValid * 60 * 1000);
};

const isOTPExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

const isOTPValid = (storedOTP, providedOTP, expiryDate) => {
  if (!storedOTP || !providedOTP) return false;
  if (isOTPExpired(expiryDate)) return false;
  return storedOTP === providedOTP.toString();
};

module.exports = { generateOTP, getOTPExpiryTime, isOTPExpired, isOTPValid };
