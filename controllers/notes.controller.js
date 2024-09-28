const Notes = require('../models/Note.model');
const Users = require('../models/User.model');
const asyncHandler = require('express-async-handler');

// toDo: import custom validation middleware here
const { validateObjId } = require('../middleware/userValidations');


/* GET ALL NOTES WITH THEIR USER */
const getAllNotesWithUser = asyncHandler(async (req, res) => {

  // Ensure that notes exist in DB
  const allNotes = await Notes.find().lean();
  if (!allNotes?.length) {
    return res.status(404).json({
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
    assignedUser,
    title,
    content
  } = req.body;

  // Use assignedUser to retrieve user doc from DB
  const foundUser = await Users.findById(assignedUser)
    .lean().exec();
  // Ensure user exists in DB before assigning them a note
  if (!foundUser) {
    return res.status(404).json({
      message: `User with ID ${assignedUser} not found`
    });
  }

  // Create new note from req.body
  const newNote = await Notes.create({
    assignedUser: assignedUser,
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
const updateNote = asyncHandler(async (req, res) => {

  // Validate note ObjId
  const id = req.params.id;
  if (!validateObjId(req, res)) {
    return;
  }

  const {
    assignedUser,
    title,
    content,
    isCompleted
  } = req.body;

  // Ensure note exists, send 404 if not
  const noteToUpdate = await Notes.findById(id)
    .lean().exec();
  if (!noteToUpdate) {
    return res.status(404).json({
      message: `Note with ID ${id} not found`
    });
  }

  // If note's original assigned user is different than the
  // assignedUserId from req.body, remove the note from the
  // original user's 'notes' array
  if (noteToUpdate.assignedUser !== assignedUser) {
    const oldUser = await Users.findOneAndUpdate(
      { _id: noteToUpdate.assignedUser },
      { $pull: { notes: noteToUpdate._id } },
      { new: true }
    );

    // If the update to remove note from original user
    // fails, return 400 bad req & message
    if (!oldUser) {
      return res.status(400).json({
        message: `Could not remove note from old user`
      });
    } else {
      // Add note to it's new user
      const newUser = await Users.findOneAndUpdate(
        { _id: assignedUser },
        { $push: { notes: noteToUpdate } },
        { new: true }
      );

      // If the update to add note to it's new user
      // fails, return 400 bad req & message
      if (!newUser) {
        return res.status(400).json({
          message: `Unable to add note to new user`
        });
      }
    }
  }

  // Update note with new data from req.body
  const updatedNote = await Notes.findOneAndUpdate(
    { _id: id },
    { assignedUser, title, content, isCompleted },
    { new: true }
  );

  // If note update fails,
  // return 400 bad req & message
  if (!updatedNote) {
    return res.status(400).json({
      message: 'Unable to update note'
    });
    // Otherwise, send response status 200 & success message
  } else {
    res.status(200).json({
      message: `Note '${updatedNote.title}' updated successfully`
    });
  }
});


/* DELETE NOTE */
const removeNote = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!validateObjId(req, res)) {
    return;
  }

  // Get note and it's assignedUser from DB
  const noteToRemove = await Notes.findById(id).exec();
  const noteUser = await Users.findById(noteToRemove.assignedUser)
    .exec();

  // Ensure both note and user exist
  if (!noteToRemove) {
    return res.status(404).json({
      message: `No note with ID ${id} found`
    });
  } else if (!noteUser) {
    return res.status(404).json({
      message: `User with ID ${noteToRemove.assignedUser} not found`
    });
  }

  // Delete note
  const result = await Notes.findOneAndDelete({ _id: id });
  if (!result) {
    return res.status(400).json({
      message: `Unable to remove note`
    });
    // Pull note ObjectId from assignedUser's 'notes' array
  } else {
    const updatedUser = await Users.findOneAndUpdate(
      { _id: noteUser._id },
      { $pull: { notes: noteToRemove._id } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({
        message: `Unable to delete note from user`
      });
    }
    // If note deleted and user updated, send response
    res.status(200).json({
      message: `Note ${noteToRemove.title} with ID ${noteToRemove._id} removed successfully`
    });
  }
});

module.exports = {
  getAllNotesWithUser,
  getOneNoteWithUser,
  createNote,
  updateNote,
  removeNote
}