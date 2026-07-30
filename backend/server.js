const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

const corsOrigin = process.env.CORS_ORIGIN?.trim()
app.use(express.json({ limit: "8mb" }))
app.use(
  cors(
    corsOrigin
      ? { origin: corsOrigin.split(",").map((o) => o.trim()), credentials: true }
      : undefined
  )
)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message))

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/data", require("./routes/dataRoutes"))
app.use("/api/marksheet", require("./routes/marksheetRoutes"))
app.use("/api/profile", require("./routes/profileRoutes"))

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found" })
})

const staticDir = path.join(__dirname, "../frontend/dist")
if (process.env.SERVE_STATIC === "true") {
  app.use(express.static(staticDir))
  app.use((_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"))
  })
}

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message || "Server error" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
