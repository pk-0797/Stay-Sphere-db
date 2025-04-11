const mailer = require("nodemailer");

const sendingMail = async (to, subject, text) => {
  try {
    const transporter = mailer.createTransport({
      service: "gmail",
      auth: {
        user: "stayspherewelcome@gmail.com",
        pass: "xlwo fmdv bawv vaft",
      },
    });

    const mailOptions = {
      from: "stayspherewelcome@gmail.com",
      to: to,
      subject: subject,
      text: text,
    };

    const mailresponse = await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully:", mailresponse);
    return mailresponse;
  } catch (error) {
    console.error("Error sending mail:", error);
    return { success: false, message: "Failed to send email" };
  }
};
module.exports = {
  sendingMail,
};
