const Users = require('../models/User.model');
const Notes = require('../models/Note.model');
const { validateUsername, validatePassword } = require('../middleware/userValidations')
const asyncHandler = require('express-async-handler');
const argon2 = require('argon2');

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await Users.find().select('-password').lean();
  if (allUsers.length < 1) {
    return res.status(400).json({ message: "No users found" });
  }
  res.status(200).json(allUsers);
});


// Get a user by ID
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


// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const duplicate = await Users.findOne({ username: username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({
      message: `Username ${username} already exists`
    });
  }

  validateUsername(req, res);
  validatePassword(req, res);

  const pwHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 12288,
    timeCost: 3,
    parallelism: 1
  });

  const newUser = await Users.create({
    username,
    password: pwHash
  });

  if (newUser) {
    return res.status(201).json({
      message: `User ${username} created successfully.`
    });
  } else {
    res.status(400).json({
      message: "Invalid user data recieved"
    });
  }
});


// Update an existing user
const updateUser = asyncHandler(async (req, res) => {

});


// Delete an existing user
const removeUser = asyncHandler(async (req, res) => {

});

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  updateUser,
  removeUser
}