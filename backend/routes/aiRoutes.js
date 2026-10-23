const express = require("express")
const { validateApiKey, chat } = require("../controllers/aiController")

const router = express.Router()

router.post("/validate", validateApiKey)
router.post("/chat", chat)

module.exports = router
