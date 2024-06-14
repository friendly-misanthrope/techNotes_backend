const Users = require('../models/User.model');
const Notes = require('../models/Note.model');
const { validateUsername, validatePassword } = require('../middleware/userValidations')
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
  const { username, password } = req.body;

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
    res.status(201).json({
      message: `User ${username} created successfully.`,
      newUser
    });
  } else {
    res.status(400).json({
      message: "Invalid user data recieved"
    });
  }


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