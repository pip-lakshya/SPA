const express = require("express")
const router = express.Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// SIGNUP
router.post("/signup", async (req, res) => {

  const { email, password } = req.body

  try {

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.json({ message: "User already exists" })
    }

    // 🔥 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      email,
      password: hashedPassword
    })

    await newUser.save()

    res.json({ message: "Signup successful" })

  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }

})


// LOGIN
router.post("/login", async (req, res) => {

  const { email, password } = req.body

  try {

    const user = await User.findOne({ email })

    if (!user) {
      return res.json({ message: "Invalid credentials" })
    }

    // 🔥 COMPARE PASSWORD
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.json({ message: "Invalid credentials" })
    }

    // 🔥 GENERATE TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,   
      { expiresIn: "1d" }
    )

    res.json({
      message: "Login successful",
      token,
      user
    })

  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }

})

module.exports = router