const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const NoteSchema = new mongoose.Schema({
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    required: [true, "Note title is required"],
    minLength: [4, "Note title must be at least 4 characters"],
    maxLength: [16, "Note title must be between 4 and 16 characters"]
  },
  content: {
    type: String,
    required: [true, "Note body cannot be blank"],
    minLength: [16, "Note body must be at least 16 characters"],
    maxLength: [760, "Note body must be between 16 and 760 characters"]
  },
  isCompleted: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

NoteSchema.plugin(AutoIncrement, {
  inc_field: 'ticketNum',
  id: 'ticketNums',
  start_seq: 4269
});

module.exports = mongoose.model('Note', NoteSchema);