const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const { upload, uploadMarksheet } = require("../controllers/marksheetController")

const router = express.Router()

const handleUpload = (req, res, next) => {
  upload.single("marksheet")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" })
    }
    next()
  })
}

router.post("/upload", authMiddleware, handleUpload, uploadMarksheet)

module.exports = router
