const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOtpEmail = async (toEmail, otpCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Your OTP Code',
        html: `
            <h2>Email Verification OTP</h2>
            <p>Your OTP code is:</p>
            <h1>${otpCode}</h1>
            <p>This OTP will expire in 5 minutes.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;