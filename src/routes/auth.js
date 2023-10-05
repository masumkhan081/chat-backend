const router = require("express").Router();
const { sendOtpMail, sendResetMail } = require("../controller/email");
const {
  signup,
  login,
  logout,
  resetPw,
  updatePw,
  markValidated,
} = require("../controller/user");
//
const { cookieValidation } = require("./middlewares");
const userModel = require("../model/user");

// router.use(cookieValidation);
router.get("/", cookieValidation, (req, res) => {
  res.send(`you are good !`);
});

router.get("/profile", (req, res) => {
  res.send(`profile`);
});

router.post("/register", (req, res) => {
  // destructuring the expected
  const { fullName, email, password, phone } = req.body;
  // validation and insertion
  signup({ fullName, email, password, phone, res });
});

router.post("/login", (req, res) => {
  // destructuring the expected
  const { email, password } = req.body;
  console.log("ewfwefwef:  ", email, password);
  // validation and login
  login({ email, password, res });
});

router.get("/logout", (res) => {
  logout(res);
});

router.post("/recovery", async (req, res) => {
  // destructuring the expected
  const { email } = req.body;
  const user = await userModel.findOne({ email }).exec();
  user
    ? sendResetMail({ user, res })
    : res.status(400).send({ message: "No Registered User With This Mail" });
});

router.get("/recovery/:token", (req, res) => {
  // destructuring the expected
  const { token } = req.params;
  resetPw({ token, res });
});

router.post("/reset", (req, res) => {
  // destructuring the expected
  const { password } = req.body;
  updatePw({ email,password, res });
});

router.post("/verification", async (req, res) => {
  const { email } = req.body;
  (await userModel.findOne({ email }))
    ? sendOtpMail({ user: { email }, res })
    : res.status(400).send({ message: "No Registered User With This Mail" });
});

router.post("/verify", (req, res) => {
  const { email, otp, token } = req.body;
  markValidated({ email, userOTP: otp, token, res });
});

module.exports = router;
