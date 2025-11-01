// config/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  }
});

const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Email Verification OTP',
      html: `
        <div style="font-family: Arial; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="color: #666; font-size: 16px;">Your verification code is:</p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #007bff;">
              <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px; margin: 0;">
                ${otp}
              </p>
            </div>
            <p style="color: #999; font-size: 14px;">This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

module.exports = { sendOTPEmail };
