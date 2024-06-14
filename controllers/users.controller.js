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
  const user = await Users.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      message: `No user with id ${req.params.id} found.`
    });
  }
  res.status(200).json(user).select('-password').lean();
});

const registerUser = asyncHandler(async (req, res) => {

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