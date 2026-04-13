const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const {
  getPeerCluster,
  getLeaderboard,
  getMyAcademicData,
  saveAcademicData
} = require("../controllers/dataController")

const router = express.Router()

router.post("/save", authMiddleware, saveAcademicData)
router.get("/me", authMiddleware, getMyAcademicData)
router.get("/leaderboard", authMiddleware, getLeaderboard)
router.get("/cluster/me", authMiddleware, getPeerCluster)

module.exports = router
