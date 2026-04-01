const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Standard Nodemailer configuration structure
// You MUST add EMAIL_USER and EMAIL_PASS to your .env file
const transporter = nodemailer.createTransport({
    service: 'gmail', // Standardizing on Gmail as per your expected app password setup
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your EduVentaAZ Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 40px; text-align: center;">
                    <div style="max-widescreen: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to EduVentaAZ</h2>
                        <p style="color: #374151; font-size: 16px;">Please use the following single-use verification code to complete your registration process. This code will expire in 10 minutes.</p>
                        
                        <div style="background-color: #e0e7ff; margin: 30px 0; padding: 20px; border-radius: 8px;">
                            <h1 style="color: #312e81; font-size: 36px; letter-spacing: 5px; margin: 0;">${otp}</h1>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email securely.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully: ', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP Email: ', error);
        throw new Error('Could not send email. Please verify SMTP settings.');
    }
};

module.exports = { sendOTPEmail };
