export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify/${token}`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY, // Render me ye key daalni hai
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: "My Awesome App", // Apna App ka naam daal de
          email: process.env.EMAIL_USER // Tera wo Gmail ID jo Brevo me verify kiya hai
        },
        to: [
          {
            email: email // Jisko mail bhejna hai
          }
        ],
        subject: "Verify Your Email",
        htmlContent: `
          <h2>Email Verification</h2>
          <p>Click below to verify your account:</p>
          <a href="${verificationLink}">Verify Email</a>
          <p>This link expires in 5 minutes.</p>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      throw new Error("Mail bhejne me error aayi");
    }

    console.log(`Verification email successfully sent to ${email} via Brevo API`);
  } catch (error) {
    console.error("Email failed:", error);
    throw new Error("Could not send verification email");
  }
};