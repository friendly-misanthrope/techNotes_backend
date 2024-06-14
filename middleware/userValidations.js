const Users = require('../models/User.model');
const asyncHandler = require('express-async-handler');

const validateUsername = (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({
      message: "Username is required"
    });
  } else if (username.length < 4 || username.length > 24) {
    return res.status(400).json({
      message: "Username must be between 4 and 24 characters"
    });
  }
}

const validatePassword = (req, res) => {
  const { password, confirmPassword } = req.body;
  if (!password) {
    return res.status(400).json({
      message: "Password is required"
    })
  } else if (password.length < 8 || password.length > 32) {
    return res.status(400).json({
      message: "Password must be between 8 and 32 characters"
    });
  } else if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match"
    })
  }
}


module.exports = {
  validateUsername,
  validatePassword
}