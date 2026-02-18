import nodemailer from "nodemailer"; // Resend ki jagah Nodemailer import karo

// 1. Transporter setup (Isey function ke bahar rakhna best practice hai)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Explicitly secure port use kar rahe hain
  secure: true, // port 465 ke liye true hota hai
  auth: {
    user: process.env.EMAIL_USER, // Tera Gmail ID (e.g., coderbhai@gmail.com)
    pass: process.env.EMAIL_PASS, // Tera 16-digit Gmail App Password
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify/${token}`;

  // 2. Mail ka content setup karo
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender ka email (Tera Gmail)
    to: email,                    // Jisko bhejna hai (User ka email)
    subject: "Verify Your Email",
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your account:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 5 minutes.</p>
    `,
  };

  // 3. Email send karo error handling ke sath
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email successfully sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    // Error throw kar dena taaki tumhare auth controller ko pata chal jaye ki mail fail hua hai
    throw new Error("Could not send verification email"); 
  }
};