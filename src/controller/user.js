require("dotenv").config();
const tokenSecret = process.env.TOKEN_SECRET;
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const { sendOTPMail } = require("./email");
const tokenHeaderKey = process.env.HEADER_KEY;
const userModel = require("../model/user");

function logout(res) {
  res.clearCookie(tokenHeaderKey);
  res.status(201).send("cleared. user logged out");
}

async function markValidated({ email, userOTP, token, res }) {
  // decrypted otp and it's expiry time, which to be validated against user typed otp
  const { expireAt, otp } = JSON.parse(
    CryptoJS.AES.decrypt(token, tokenSecret).toString(CryptoJS.enc.Utf8)
  );

  if (new Date().getTime() > expireAt) {
    res.status(400).send({ message: "OTP expired" });
  } else if (userOTP === otp) {
    (await userModel.findOneAndUpdate({ email }, { isVerified: true }))
      ? res.status(200).send({ message: "Account verified. You may login " })
      : res.status(400).send({ message: "Error verifying your account" });
  } else {
    res.status(400).send({ message: "Invalid OTP" });
  }
}

async function signup({ fullName, email, password, phone, res }) {
  // already registered or not
  const existence = await userModel.findOne({ email: email }).exec();

  if (existence?.isVerified) {
    res.status(409).send("Email is already in use. Please log in");
  } else if (existence?.isVerified == false) {
    sendOTPMail({ user: existence, res });
  } else {
    const user = await new userModel({
      fullName,
      email,
      password,
      phone,
    }).save();
    user
      ? sendOTPMail({ user, res })
      : res.status(400).send("Error creating account");
  }
}

async function login({ email, password, res }) {
  res.status(400).send("Wrong Credentials");
  // already registered or not
  const existence = await userModel.findOne({ email, password });

  if (existence) {
    // email and associated password matched
    if (existence.isVerified) {
      console.log(tokenHeaderKey, "  <<<<    ", existence.id, tokenSecret);
      res
        .status(200)
        .cookie(tokenHeaderKey, jwt.sign(existence.id, tokenSecret), {
          expires: new Date(Date.now() + 36000),
          overwrite: true,
          httpOnly: true,
        })
        .send({
          email,
          message: "You are logged in",
        });
    }
    // email found but no match for password
    else {
      res.status(401).send("Account Not Verified Yet");
    }
  }
  // no user with that email in system
  else {
    res.status(400).send("Wrong Credentials");
  }
}

async function resetPw({ token, res }) {
  var bytes = CryptoJS.AES.decrypt(token, tokenSecret);
  var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

  console.log(decryptedData); // [{id: 1}, {id: 2}]
  console.log(">>  ", token);
  res.send("Hello");
}

async function updatePw({ email, password, res }) {
  (await userModel.findOneAndUpdate({ email }, { password }))
    ? res.status(200).send({ message: "Password updated successfully " })
    : res.status(400).send({ message: "Error updating password" });
}

module.exports = {
  signup,
  login,
  logout,
  resetPw,
  updatePw,
  markValidated,
};
