const jwt = require("jsonwebtoken");
require("dotenv").config();
const tokenSecret = process.env.JWT_SECRET;
const tokenHeaderKey = process.env.HEADER_KEY;

function cookieValidation(req, res, next) {
  const token = req.cookies[tokenHeaderKey];

  if (token) {
    try {
      jwt.verify(token, tokenSecret)
        ? next()
        : res.status(401).send("fuck off !");
    } catch (err) {
      res.status(401).send("bad token !");
    }
  } else {
    res.status(401).send("you are not logged in");
  }
}

module.exports = { cookieValidation };

//  401 - invalid credentials
//  403 - Forbidden - has valid credentials but not enough privileges
//  404 Not Found
//  400 - "The request could not be understood by the server - clients fault
//  409 Conflict - if the server will not process a request, not the client's fault
// 200 OK
// 201 Created
// 302 Found
