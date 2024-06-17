const Notes = require('../models/Note.model');
const Users = require('../models/User.model');
const asyncHandler = require('express-async-handler');

// Custom validation middleware here



/* GET ALL NOTES WITH THEIR USER */
const getAllNotesWithUser = asyncHandler(async (req, res) => {
  const allNotes = await Notes.find().lean();

  const notesWithUser = Promise.all(allNotes.map(asyncHandler(async (note) => {
    const noteUser = await Users.findById(note.assignedUser).lean().exec();
    note.assignedUser = noteUser;
    return note;
  })));

  return res.status(200).json(notesWithUser);
});


/* GET ONE NOTE WITH ITS USER */
const getOneNoteWithUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const note = await Notes.findById(id).lean().exec();
  const user = await Users.findById(note.assignedUser).lean().exec();
  const noteWithUser = { ...note, assignedUser: user };
  return res.status(200).json(noteWithUser);
});


/* CREATE NOTE AND ASSIGN IT A USER */
const createNote = asyncHandler(async (req, res) => {

});


/* UPDATE NOTE AND/OR ITS ASSIGNED USER */
const updateNote = asyncHandler(async (req, res) => {

});


/* DELETE NOTE */
const deleteNote = asyncHandler(async (req, res) => {

});

module.exports = {
  getAllNotesWithUser,
  getOneNoteWithUser,
  createNote,
  updateNote,
  deleteNote
}