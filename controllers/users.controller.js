const Users = require('../models/User.model');
const Notes = require('../models/Note.model');
const asyncHandler = require('express-async-handler');
const argon2 = require('argon2');
const {
  validateUsername,
  validatePassword,
  validateObjId,
  validateUserStatus
} = require('../middleware/userValidations');

/* GET ALL USERS */
const getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await Users.find().select('-password').lean();
  if (!allUsers?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.status(200).json(allUsers);
});


/* GET ONE USER BY ID */
const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!validateObjId(req, res)) {
    return;
  }

  const user = await Users.findById(id).select('-password').lean().exec();
  if (!user) {
    return res.status(404).json({
      message: `No user with id ${id} found.`
    });
  }
  res.status(200).json(user);
});


/* REGISTER NEW USER */
const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check for duplicate usernames
  const duplicate = await Users.findOne({ username: username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({
      message: `Username ${username} is taken`
    });
  }

  // Validate user and password
  if (!validatePassword(req, res) ||
    !validateUsername(req, res)) {
    return;
  }

  // Hash password
  const pwHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });

  // Create user with username and hashed password
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


/* UPDATE EXISTING USER */
const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!validateObjId(req, res)) {
    return;
  }

  // Ensure user with provided ID exists
  const existingUser = await Users.findById(id).lean().exec();
  if (!existingUser) {
    return res.status(400).json({
      message: `No user with ID ${id} found`
    });
  }

  const {
    username,
    password,
    roles,
    isActive
  } = req.body;

  // validate user data
  if (!validateUsername(req, res) ||
    !validateUserStatus(req, res)) {
    return;
  }

  // Look for username duplicates with a different ObjectID
  const duplicate = await Users.findOne({ username }).lean().exec();

  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({
      message: "This username is taken"
    });
  }

  //  If a new pw is provided, validate/hash it and update user
  if (password) {
    if (!validatePassword(req, res)) {
      return;
    }

    pwHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    });

    const updatedUser = await Users.findByIdAndUpdate(id,
      { username, roles, password: pwHash, isActive },
      { new: true }
    );

    if (updatedUser) {
      return res.status(200).json({
        message: `User ${username} updated successfully`,
      });
    }
    // If no new pw provided, update user with pw field omitted
  } else {
    const updatedUser = await Users.findByIdAndUpdate(id,
      { username, roles, isActive },
      { new: true }
    );

    if (updatedUser) {
      return res.status(200).json({
        message: `User ${username} updated successfully`,
      });
    }
  }
  return res.status(400).json({
    message: "Invalid user update data"
  });
});


/* DELETE AN EXISTING USER */
const removeUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!validateObjId(req, res)) {
    return;
  }
  // only allow user to be deleted if no open notes are assigned
  const userNotes = await Notes.findOne({ assignedUser: id }).lean().exec();

  if (userNotes?.length) {
    return res.status(400).json({
      message: `User ${id} cannot be deleted because they have notes assigned`
    });
  }

  // get user from DB
  const userToDelete = await Users.findById(id).lean().exec();

  // Ensure user exists before proceeding
  if (!userToDelete) {
    return res.status(400).json({
      message: `No user with ID ${id} found`
    });
  }

  // find user by ID and delete
  const result = await Users.findOneAndDelete({_id: id});

  // Send response 200 if user is deleted successfully
  if (result) {
    res.status(200).json({
      message: `User ${result.username} with ID ${result._id} deleted successfully`
    });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  updateUser,
  removeUser
}