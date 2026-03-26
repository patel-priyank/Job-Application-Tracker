import nodemailer from 'nodemailer';

const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  const service = process.env.EMAIL_SERVICE;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!service || !user || !pass) {
    throw new Error('Email service not configured.');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });

    const mailOptions = {
      from: user,
      to,
      subject,
      text,
      ...(html && { html })
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email sending error: ', err);
    throw err;
  }
};

export default sendEmail;
