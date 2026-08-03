import nodemailer from "nodemailer";

export const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const textTemplate = `Your verification code is: ${otp}. It expires in 10 minutes.`;
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>E-LogBook Registration</h2>
      <p>Your verification code is:</p>
      <h1 style="color: #0d9488; letter-spacing: 5px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"E-LogBook" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "E-LogBook Registration OTP",
    text: textTemplate,
    html: htmlTemplate,
  });
};

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const textTemplate = `Your password reset code is: ${otp}. It expires in 10 minutes.`;
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>E-LogBook Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1 style="color: #0d9488; letter-spacing: 5px;">${otp}</h1>
      <p>This code will expire in 10 minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"E-LogBook" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "E-LogBook Password Reset",
    text: textTemplate,
    html: htmlTemplate,
  });
};
