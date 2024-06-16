const Users = require('../models/User.model');
const Notes = require('../models/Note.model');
const asyncHandler = require('express-async-handler');
const argon2 = require('argon2');
const {
  validateUsername,
  validatePassword,
  validateObjId
} = require('../middleware/userValidations');

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
  validateObjId(req, res);

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
    memoryCost: 19456,
    timeCost: 2,
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
  const id = req.params.id;
  validateObjId(req, res);

  const existingUser = await Users.findById(id).exec().lean();
  if (!existingUser) {
    return res.status(400).json({
      message: `No user with ID ${id} found`
    });
  }

  const {
    username,
    password,
    confirmPassword,
    roles,
    isActive
  } = req.body;

  const duplicate = await Users.findOne({ username }).lean().exec();

  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({
      message: "This username is taken"
    })
  }

  validateUsername(req, res);


  if (password) {
    validatePassword(req, res);
    }
    existingUser.password = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    })
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