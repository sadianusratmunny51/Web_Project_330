const nodemailer = require("nodemailer");

async function sendEmail(to, subject, message) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or smtp
    auth: {
      user: "hazera.ritu2003@gmail.com",
      pass: "isgd gqus bvgt cruq"
    }
  });

  await transporter.sendMail({
    from: "hazera.ritu2003@gmail.com",
    to,
    subject,
    text: message,
  });
}

module.exports = { sendEmail };
