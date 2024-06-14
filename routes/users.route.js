const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  registerUser,
  updateUser,
  removeUser
} = require('../controllers/users.controller');

router.route('/')
  .get(getAllUsers)
  .post(registerUser)

router.route('/user/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(removeUser)
module.exports = router;