const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (toEmail, otpCode) => {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: [toEmail],
    subject: 'Your OTP Code',
    html: `
      <h2>Email Verification OTP</h2>
      <p>Your OTP code is:</p>
      <h1>${otpCode}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send email');
  }

  return data;
};

module.exports = sendOtpEmail;