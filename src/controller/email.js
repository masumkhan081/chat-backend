require("dotenv").config();
const nodemailer = require("nodemailer");
const CryptoJS = require("crypto-js");
const tokenSecret = process.env.TOKEN_SECRET;

//  send otp to user email for email verification
const sendOTPMail = ({ user, res }) => {
  //
  const generatedOTP = generateOTP();
  //
  const mailOptions = getMailOptions({
    to: user.email,
    subject: () => setSubject("verification"),
    html: () => getVerificationMessage(generatedOTP),
  });
  //
  const transporter = getTransporter();

  transporter
    .sendMail(mailOptions)
    .then((result) => {
      result.accepted.includes(user.email)
        ? res.status(201).send({
            message: "An OTP has been sent to your email for verification.",
            token: getOtpToken(generatedOTP),
          })
        : res.status(400).send({ message: "Error sendign otp to the mail" });
    })
    .catch((err) => {
      // console.log(err);
      res.send(err.message);
    });
};

//  send password reset link to user email
async function sendResetMail({ user, res }) {
  const mailOptions = getMailOptions({
    to: user.email,
    subject: () => setSubject("recovery"),
    html: () => getResetLink(user),
  });
  //
  const transporter = getTransporter();
  //
  transporter
    .sendMail(mailOptions)
    .then((result) => {
      console.log(`reset link sent: : ${result.messageId}`);
      result
        ? res.send(JSON.stringify(result))
        : res
            .status(400)
            .send({ message: "Error sendign password reset mail" });
    })
    .catch((err) => {
      console.log(err);
      res.send(err.message);
    });
}

const generateOTP = () => {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const getVerificationMessage = (otp) =>
  `<h4 style="color:blue;text-align:center;">Please copy or type the OTP provided below: <br><br>${otp}`;

function getResetLink(user) {
  return (
    `<h4 style="color:blue;text-align:center;">Please click the link to reset your password: </h4><br><br>${process.env.BASE_URL}/auth/recovery/` +
    `${CryptoJS.AES.encrypt(
      JSON.stringify({
        id: user.id,
        email: user.email,
        expireAt: new Date().getTime() + 15 * 60000,
      }),
      tokenSecret
    ).toString()}`
  );
}

// return a relatable email sibject based on purpose of the mail
const setSubject = (action) =>
  action === "recovery"
    ? "Auth-Full: Recover Your Password"
    : action === "verification"
    ? "Auth-Full: Verify Your Email"
    : "";

const getMailOptions = ({ to, subject, html }) => {
  return {
    from: process.env.SENDER,
    to,
    subject: subject(),
    html: html(),
  };
};

const getTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SENDER,
      pass: process.env.PASS,
    },
    tls: {
      rejectUnAuthorized: true,
    },
  });

//  create and return a encrypted token holding data: otp and expiration time for it
const getOtpToken = (otp) =>
  CryptoJS.AES.encrypt(
    JSON.stringify({
      otp,
      expireAt: new Date().getTime() + 5 * 60000,
    }),
    tokenSecret
  ).toString();

module.exports = {
  sendResetMail,
  sendOTPMail,
};

