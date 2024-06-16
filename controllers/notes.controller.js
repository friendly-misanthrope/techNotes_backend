const Notes = require('../models/Note.model');
const Users = require('../models/User.model');
const asyncHandler = require('express-async-handler');

// Custom validation middleware here



/* GET ALL NOTES WITH THEIR USER */
const getAllNotesWithUser = asyncHandler(async(req, res) => {

});


/* GET ONE NOTE WITH ITS USER */
const getOneNoteWithUser = asyncHandler(async(req, res) => {

});


/* CREATE NOTE AND ASSIGN IT A USER */
const createNote = asyncHandler(async(req, res) => {

});


/* UPDATE NOTE AND/OR ITS ASSIGNED USER */
const updateNote = asyncHandler(async(req, res) => {

});


/* DELETE NOTE */
const deleteNote = asyncHandler(async(req, res) => {

});

module.exports = {
  getAllNotesWithUser,
  getOneNoteWithUser,
  createNote,
  updateNote,
  deleteNote
}