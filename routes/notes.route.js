const express = require('express');
const router = express.Router();
const {
  getAllNotesWithUser,
  getOneNoteWithUser,
  createNote,
  updateNote,
  removeNote
} = require('../controllers/notes.controller');



router.route('/')
  .get(getAllNotesWithUser)
  .post(createNote)

router.route('/:id')
  .get(getOneNoteWithUser)
  .patch(updateNote)
  .delete(removeNote)



module.exports = router;