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
  }
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