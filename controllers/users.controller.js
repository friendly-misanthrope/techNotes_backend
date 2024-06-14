const Users = require('../models/User.model');
const Notes = require('../models/Note.model');
const asyncHandler = require('express-async-handler');
const argon2 = require('argon2');

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await Users.find().select('-password').lean();
  if (!allUsers) {
    return res.status(400).json({ message: "No users found" });
  }
  res.status(201).json(allUsers);
});

const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await Users.findById(id).select('-password').lean().exec();
  if (!user) {
    return res.status(404).json({
      message: `No user with id ${id} found.`
    });
  }
  res.status(200).json(user);
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, password, confirmPassword, roles } = req.body;

  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({
      message: "All fields are required"
    });
  } else if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match"
    });
  }

  const duplicate = await Users.findOne({ username: username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({
      message: `Username ${username} already exists`
    });
  }

  const pwHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 12288,
    timeCost: 3,
    parallelism: 1
  });

  const newUser = await Users.create({
    username,
    password: pwHash,
    roles
  }).select('-password').lean().exec();

  res.status(201).json({
    message: `User ${username} created successfully.`,
    newUser: newUser
  });
});

const updateUser = asyncHandler(async (req, res) => {

});

const removeUser = asyncHandler(async (req, res) => {

});

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  updateUser,
  removeUser
}