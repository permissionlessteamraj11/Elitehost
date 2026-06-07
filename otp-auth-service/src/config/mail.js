const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'EliteHosting <onboarding@resend.dev>',
      to: email,
      subject: 'Your Verification Code - EliteHosting',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #00E5FF; text-align: center;">EliteHosting</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px;">
            ${otp}
          </div>
          <p style="margin-top: 20px;">This code will expire in 5 minutes. Do not share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2025 EliteHosting. All rights reserved.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

module.exports = { sendOTPEmail };
