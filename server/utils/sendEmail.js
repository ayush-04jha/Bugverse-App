import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationLink = `${process.env.CLIENT_URL}/verify/${token}`;

  await transporter.sendMail({
    from: `"BugVerse" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your account:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 5 minutes.</p>
    `,
  });
};