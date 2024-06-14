const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    minLength: [4, "Username must be at least 4 characters"],
    maxLength: [16, "Username must be between 4 and 16 characters"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must be at least 8 characters"],
    maxLength: [64, "Password must be between 8 and 64 characters"]
  },
  roles: [{
    type: String,
    default: "Employee"
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toObject: { virutals: true }
});

// ToDo
/* Refactor to compare passwords without using virutals
create compare password function
on User schema (Schema.methods.comparePassword(password)),
& call method on user instance from controller. */

/* Virtual confirmPassword field */
// UserSchema.virtual('confirmPassword')
//   .set(function (confPass) {
//     this._confirmPassword = confPass
//   })
//   .get(function () {
//     return this._confirmPassword
//   });

//ToDo: Put this in user registration controller
UserSchema.methods.comparePasswords = (req, res, next) => {
  if (!req.password || req.password !== req.confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  next();
}

UserSchema.methods.checkLoginPassword = (req, res, next) => {

}

module.exports = mongoose.model('User', UserSchema);