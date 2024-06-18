const Notes = require('../models/Note.model');
const Users = require('../models/User.model');
const asyncHandler = require('express-async-handler');

// toDo: import custom validation middleware here



/* GET ALL NOTES WITH THEIR USER */
const getAllNotesWithUser = asyncHandler(async (req, res) => {

  // Ensure that notes exist in DB
  const allNotes = await Notes.find().lean();
  if (!allNotes?.length) {
    return res.status(400).json({
      message: `No notes found`
    });
  }

  // Iterate over notes - for every note,
  // retrieve it's assigned user by ObjId
  // and overwrite note.assignedUser with
  // user doc
  const notesWithUser = await Promise.all(
    allNotes.map(asyncHandler(async (note) => {
      const noteUser = await Users.findById(note.assignedUser)
        .select('-password -notes').lean().exec();
      note.assignedUser = noteUser;
      return note;
    }))
  );
  // Send status 200 & notes with their respective user doc
  return res.status(200).json(notesWithUser);
});


/* GET ONE NOTE WITH ITS USER */
const getOneNoteWithUser = asyncHandler(async (req, res) => {

  const id = req.params.id;

  // Find note and user in DB
  const note = await Notes.findById(id).lean().exec();
  const user = await Users.findById(note.assignedUser)
    .select('-password -notes').lean().exec();

  // Overwrite note's assignedUser field with user doc
  const noteWithUser = { ...note, assignedUser: user };

  // Send status 200 and note with user
  return res.status(200).json(noteWithUser);
});


/* CREATE NOTE AND ASSIGN IT A USER */
const createNote = asyncHandler(async (req, res) => {

  const {
    assignedUserId,
    title,
    content
  } = req.body;

  // Use assignedUserId to retrieve user doc from DB
  const foundUser = await Users.findById(assignedUserId)
    .lean().exec();
  // Ensure user exists in DB before assigning them a note
  if (!foundUser) {
    return res.status(400).json({
      message: `User with ID ${assignedUserId} not found`
    });
  }

  // Create new note from req.body
  const newNote = await Notes.create({
    assignedUser: assignedUserId,
    title,
    content
  });

  // If note was created successfully,
  // push note's ObjectId to assignedUser's
  // notes array
  if (newNote) {
    const updatedUser = await Users.findOneAndUpdate(
      { _id: newNote.assignedUser },
      { $push: { notes: newNote } },
      { new: true }
    );

    // If user updated successfully,
    // return response status 201 with success message
    if (updatedUser) {
      return res.status(201).json({
        message: `New note '${newNote.title}' created and assigned to ${updatedUser.username}`
      });
    }
    // If unable to create note or user,
    // send 400 bad req with appropriate message
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
// toDo: Ensure there's no duplicate note title belonging to the assigned user
const updateNote = asyncHandler(async (req, res) => {
  
  // Validate note ObjId
  const id = req.params.id;
  if (!validateObjId(req, res)) {
    return;
  }

  const {
    assignedUserId,
    title,
    content,
    isCompleted
  } = req.body;

  // Ensure note exists
  const noteToUpdate = await Notes.findById(id)
    .lean().exec();
  if (!noteToUpdate) {
    return res.status(400).json({
      message: `Note with ID ${id} not found`
    });
  }

  //toDo:  if assignedUserId changes,
  //todo   remove note from old user
  //todo   and assign it to the new user
  if (noteToUpdate.assignedUser !== assignedUserId) {
    const userToRemoveNoteFrom = await Users.findOneAndUpdate(
      { _id: noteToUpdate.assignedUser },
      // pull note id from old user, push to new user
      { $pull: { notes: noteToUpdate } }
    );
    if (!userToRemoveNoteFrom) {
      return res.status(400).json({
        message: `Could not remove note from old user`
      });
    } else {
      const userToAddNoteTo = await Users.findOneAndUpdate(
        { _id: assignedUserId },
        { $push: { notes: noteToUpdate } }
      );
      if (!userToAddNoteTo) {
        return res.status(400).json({
          message: `Unable to add note to new user`
        })
      }
    }
  }

  const updatedNote = await Notes.findOneAndUpdate(
    { _id: id },
    {
      assignedUserId,
      title,
      content,
      isCompleted
    }
  );

  if (!updatedNote) {
    return res.status(400).json({
      message: 'Unable to update note'
    });
  } else {
    res.status(200).json({
      message: `Note ${updatedNote.title} updated successfully`
    });
  }
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