const express = require("express");
const app = express();
require("dotenv").config();
const initDB = require("./src/datatier");
// const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// initialize the database
initDB();

// middlewares
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
//

// routes
app.use("/auth", require("./src/routes/auth"));

app.listen(3000, () => {
  console.log("running ...");
});

// // close the server
app.get("/quit", function (req, res) {
  res.send("closed");
});
// server closing endpoint; no need what so ever
app.get("/", (req, res) => {
  res.send(`<a href="/quit">quit</a>`);
});
