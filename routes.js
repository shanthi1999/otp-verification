const express = require("express");
const routes = express.Router();
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "verysecretkey";
require("dotenv").config();
const twilio = require("twilio");

routes.post("/createOtp", async (req, res) => {
  const otp = otpGenerator.generate(6, {
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
  const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
  const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
  const data = `${req.body.phone}.${otp}.${expires}`; // phone.otp.expiry_timestamp
  const hash = crypto.createHmac("sha256", key).update(data).digest("hex"); // creating SHA256 hash of the data
  const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
  // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
  sendSMS(req.body.phone,
    `Your OTP is ${otp}. it will expire in 5 minutes`
  )
  res.json({data:fullHash})
});

routes.post("/verifyOtp", async (req, res) => {
    console.log("comming to verify....")
  let [hashValue, expires] = req.body.hash.split(".");
  // Check if expiry time has passed
  let now = Date.now();
  if (now > parseInt(expires)) return res.send("otp not verified");
  // Calculate new hash with the same key and the same algorithm
  let data = `${req.body.phone}.${req.body.otp}.${expires}`;
  let newCalculatedHash = crypto
    .createHmac("sha256", key)
    .update(data)
    .digest("hex");
  // Match the hashes
  if (newCalculatedHash === hashValue) {
    res.send("otp verified");
  } else {
    res.send("otp not verified");
  }
});

const sendSMS = (phone, message) => {
  const accountSid = process.env.AUTH_ID;
  const authToken = process.env.AUTH_TOKEN;
  var client = new twilio(accountSid, authToken);

  client.messages
    .create({
      body: `${message}`,
      to: `${phone}`,
      from: "+14694143293",
    })
    .then((response) => {
      console.log("message send successfully");
    })
    .catch((err) => {
      console.log("errr", err);
    });
};

module.exports = routes;
