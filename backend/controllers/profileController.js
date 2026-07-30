const bcrypt = require("bcryptjs")
const User = require("../models/User")
const AcademicData = require("../models/AcademicData")

const allowed = [
  "name", "phone", "dob", "gender", "college", "university", "country", "state", "city", "bio",
  "course", "department", "branch", "currentYear", "currentSemester", "enrollmentNumber",
  "rollNumber", "expectedGraduationYear", "privacySettings", "notificationSettings", "themePreference"
]

const publicUser = (user) => {
  const value = user.toObject ? user.toObject() : user
  delete value.password
  delete value.googleId
  return { ...value, authMethod: user.googleId ? "Google" : "Email Password" }
}

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res)
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" })
  }
}

exports.getProfile = handle(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: "User not found" })
  const academic = await AcademicData.findOne({ userId: req.user.id }).lean()
  res.json({ user: publicUser(user), academic: academic || null })
})

exports.updateProfile = handle(async (req, res) => {
  const updates = {}
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key]
  })
  if (updates.name !== undefined && !String(updates.name).trim()) {
    return res.status(400).json({ message: "Name is required" })
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, { returnDocument: "after", runValidators: true })
  if (!user) return res.status(404).json({ message: "User not found" })
  res.json({ message: "Profile updated successfully", user: publicUser(user) })
})

exports.updateSettings = handle(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: "User not found" })

  if (req.body.privacySettings && typeof req.body.privacySettings === "object") {
    Object.assign(user.privacySettings, req.body.privacySettings)
  }
  if (req.body.notificationSettings && typeof req.body.notificationSettings === "object") {
    Object.assign(user.notificationSettings, req.body.notificationSettings)
  }
  if (req.body.themePreference !== undefined) {
    const theme = String(req.body.themePreference)
    if (!["light", "dark", "system"].includes(theme)) {
      return res.status(400).json({ message: "Theme must be light, dark, or system" })
    }
    user.themePreference = theme
  }

  await user.save()
  res.json({ message: "Settings saved successfully", user: publicUser(user) })
})

exports.updateTheme = handle(async (req, res) => {
  const theme = String(req.body?.themePreference || req.body?.theme || "")
  if (!["light", "dark", "system"].includes(theme)) {
    return res.status(400).json({ message: "Theme must be light, dark, or system" })
  }
  const user = await User.findByIdAndUpdate(req.user.id, { themePreference: theme }, { returnDocument: "after", runValidators: true })
  if (!user) return res.status(404).json({ message: "User not found" })
  res.json({ message: "Theme updated", themePreference: user.themePreference, user: publicUser(user) })
})

exports.changePassword = handle(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: "User not found" })
  if (!user.password) return res.status(400).json({ message: "Password changes are managed through Google" })
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(String(newPassword || ""))) {
    return res.status(400).json({ message: "Use 8+ characters with uppercase, lowercase, number, and special character" })
  }
  if (!(await bcrypt.compare(String(currentPassword || ""), user.password))) {
    return res.status(400).json({ message: "Current password is incorrect" })
  }
  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()
  res.json({ message: "Password changed successfully" })
})

exports.updateAvatar = handle(async (req, res) => {
  const image = String(req.body?.profileImage || "")
  if (!image.startsWith("data:image/") || image.length > 1500000) {
    return res.status(400).json({ message: "Upload a compressed image under 1MB" })
  }
  const user = await User.findByIdAndUpdate(req.user.id, { profileImage: image }, { returnDocument: "after" })
  if (!user) return res.status(404).json({ message: "User not found" })
  res.json({ message: "Profile photo updated", user: publicUser(user) })
})

exports.removeAvatar = handle(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { profileImage: "" }, { returnDocument: "after" })
  if (!user) return res.status(404).json({ message: "User not found" })
  res.json({ message: "Profile photo removed", user: publicUser(user) })
})

exports.exportData = handle(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: "User not found" })
  const academic = await AcademicData.findOne({ userId: req.user.id }).lean()
  res.json({ profile: publicUser(user), academic })
})

exports.deleteAccount = handle(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: "User not found" })
  if (user.password && !(await bcrypt.compare(String(req.body?.password || ""), user.password))) {
    return res.status(400).json({ message: "Password confirmation is required" })
  }
  await AcademicData.deleteOne({ userId: user._id })
  await User.deleteOne({ _id: user._id })
  res.json({ message: "Account deleted" })
})
