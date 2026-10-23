const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  const rawToken = req.headers.authorization
  const jwtSecret = process.env.JWT_SECRET || "secretkey123"

  if (!rawToken) {
    return res.status(401).json({ message: "No token" })
  }

  const token = rawToken.replace(/^Bearer\s+/i, "").trim()

  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: "Invalid token" })
  }
}

module.exports = authMiddleware
