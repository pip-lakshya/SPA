const express = require("express")
const router = express.Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { verifyGoogleCredential } = require("../services/googleAuthService")
require("dotenv").config()

const jwtSecret = () => process.env.JWT_SECRET || "secretkey123"

const signToken = (userId) =>
  jwt.sign({ id: userId }, jwtSecret(), { expiresIn: "1d" })

const formatUser = (user) => ({
  _id: user._id,
  name: user.name || "",
  email: user.email
})

const normalizeEmail = (email) => String(email || "").trim().toLowerCase()

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body

  try {
    if (!String(name || "").trim() || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const emailNorm = normalizeEmail(email)
    const existingUser = await User.findOne({ email: emailNorm })
    if (existingUser) {
      return res.json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      name: String(name || "").trim(),
      email: emailNorm,
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
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const emailNorm = normalizeEmail(email)
    const user = await User.findOne({ email: emailNorm })

    if (!user) {
      return res.json({ message: "Invalid credentials" })
    }

    if (!user.password) {
      if (user.googleId) {
        return res.json({ message: "This account uses Google sign-in" })
      }
      return res.json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.json({ message: "Invalid credentials" })
    }

    const token = signToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: formatUser(user)
    })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// GOOGLE (credential = ID token from @react-oauth/google)
router.post("/google", async (req, res) => {
  const { credential } = req.body

  try {
    if (!credential || typeof credential !== "string") {
      return res.status(400).json({ message: "Missing Google credential" })
    }

    const payload = await verifyGoogleCredential(credential)
    const googleId = payload.sub
    const emailNorm = normalizeEmail(payload.email)
    const name = String(payload.name || "").trim()

    let user = await User.findOne({ googleId })

    if (!user) {
      user = await User.findOne({ email: emailNorm })
      if (user) {
        user.googleId = googleId
        if (name && !user.name) {
          user.name = name
        }
        await user.save()
      }
    }

    if (!user) {
      user = new User({
        name,
        email: emailNorm,
        googleId
      })
      await user.save()
    }

    const token = signToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: formatUser(user)
    })
  } catch (err) {
    if (err.code === "GOOGLE_DEPENDENCY_MISSING") {
      return res.status(500).json({
        message: "Google sign-in is not available on the server (missing dependency)"
      })
    }
    if (err.code === "GOOGLE_NOT_CONFIGURED") {
      return res.status(500).json({
        message:
          "Google sign-in is not configured on the server (missing GOOGLE_CLIENT_ID)"
      })
    }
    return res.status(401).json({ message: "Google sign-in failed" })
  }
})

module.exports = router
