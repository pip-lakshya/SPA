const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization
  const jwtSecret = process.env.JWT_SECRET || "secretkey123"

  if (!token) {
    return res.status(401).json({ message: "No token" })
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
