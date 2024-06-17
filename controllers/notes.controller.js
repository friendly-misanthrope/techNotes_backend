const Notes = require('../models/Note.model');
const Users = require('../models/User.model');
const asyncHandler = require('express-async-handler');

// Custom validation middleware here



/* GET ALL NOTES WITH THEIR USER */
const getAllNotesWithUser = asyncHandler(async (req, res) => {
  const allNotes = await Notes.find().lean();

  if (!allNotes?.length) {
    return res.status(400).json({
      message: `No notes found`
    });
  }

  const notesWithUser = await Promise.all(allNotes.map(asyncHandler(async (note) => {
    const noteUser = await Users.findById(note.assignedUser).select('-password -notes').lean().exec();
    note.assignedUser = noteUser;
    return note;
  })));

  return res.status(200).json(notesWithUser);
});


/* GET ONE NOTE WITH ITS USER */
const getOneNoteWithUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const note = await Notes.findById(id).lean().exec();
  const user = await Users.findById(note.assignedUser).select('-password -notes').lean().exec();
  const noteWithUser = { ...note, assignedUser: user };
  return res.status(200).json(noteWithUser);
});


/* CREATE NOTE AND ASSIGN IT A USER */
const createNote = asyncHandler(async (req, res) => {

  const {
    assignedUserId,
    title,
    content
  } = req.body;

  const foundUser = await Users.findById(assignedUserId).lean().exec();

  if (!foundUser) {
    return res.status(400).json({
      message: `User with ID ${assignedUserId} not found`
    });
  }

  const newNote = await Notes.create({
    assignedUser: assignedUserId,
    title,
    content
  });

  if (newNote) {
    const updatedUser = await Users.findOneAndUpdate(
      { _id: newNote.assignedUser },
      { $push: { notes: newNote } },
      { new: true }
    );

    if (updatedUser) {
      return res.status(201).json({
        message: `New note '${newNote.title}' created and assigned to ${updatedUser.username}`
      });
    }
  } else {
    return res.status(400).json({
      message: `Unable to update user with new note`
    });
  }
  res.status(400).json({
    message: `Unable to create new note`
  });
});


/* UPDATE NOTE AND/OR ITS ASSIGNED USER */
const updateNote = asyncHandler(async (req, res) => {

});


/* DELETE NOTE */
const removeNote = asyncHandler(async (req, res) => {

});

module.exports = {
  getAllNotesWithUser,
  getOneNoteWithUser,
  createNote,
  updateNote,
  removeNote
}