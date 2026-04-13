const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ""
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  }
})

module.exports = mongoose.model("User", userSchema)
