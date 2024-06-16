const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  roles: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note"
  }]
}, {
  timestamps: true
});

UserSchema.pre('save', function(next) {
  if (this.roles.length < 1) {
    this.roles.push("Employee")
  }
  next();
})

module.exports = mongoose.model('User', UserSchema);