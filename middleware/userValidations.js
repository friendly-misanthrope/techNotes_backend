const Users = require('../models/User.model');

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
    res.status(400).json({
      message: "Password is required"
    })
    return false;
  } else if (password.length < 8 || password.length > 32) {
    res.status(400).json({
      message: "Password must be between 8 and 32 characters"
    })
    return false;
  } else if (password !== confirmPassword) {
    res.status(400).json({
      message: "Passwords do not match"
    })
    return false;
  }
}

const validateObjId = (req, res) => {
  const id = req.params.id;
  if (id.length !== 24) {
    return res.status(400).json({
      message: `Invalid ObjectId for user`
    });
  }
}

const validateUserStatus = (req, res) => {
  const { roles, isActive } = req.body;
  if (!Array.isArray(roles) || typeof(roles[0] !== 'string')) {
    res.status(400).json({
      message: `Invalid roles data`
    })
    return false;
  } else if (typeof(isActive) !== 'boolean'){
    res.status(400).json({
      message: `isActive must be a boolean value`
    })
    return false;
  }
}


module.exports = {
  validateUsername,
  validatePassword,
  validateObjId,
  validateUserStatus
}