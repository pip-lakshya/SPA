const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: "" },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, trim: true },
  googleId: { type: String, sparse: true, unique: true, trim: true },
  profileImage: { type: String, default: "" },
  phone: { type: String, trim: true, default: "" }, dob: { type: String, default: "" }, gender: { type: String, default: "" },
  college: { type: String, trim: true, default: "" }, university: { type: String, trim: true, default: "" }, country: { type: String, trim: true, default: "" }, state: { type: String, trim: true, default: "" }, city: { type: String, trim: true, default: "" }, bio: { type: String, trim: true, maxlength: 500, default: "" },
  course: { type: String, trim: true, default: "" }, department: { type: String, trim: true, default: "" }, branch: { type: String, trim: true, default: "" }, currentYear: { type: String, default: "" }, currentSemester: { type: String, default: "" }, enrollmentNumber: { type: String, trim: true, default: "" }, rollNumber: { type: String, trim: true, default: "" }, expectedGraduationYear: { type: String, default: "" },
  themePreference: { type: String, enum: ["light", "dark", "system"], default: "system" },
  privacySettings: { showProfile: { type: Boolean, default: true }, showOnLeaderboard: { type: Boolean, default: true }, showCgpa: { type: Boolean, default: true }, showEmail: { type: Boolean, default: false }, allowComparison: { type: Boolean, default: true } },
  notificationSettings: { email: { type: Boolean, default: true }, leaderboard: { type: Boolean, default: true }, academicAlerts: { type: Boolean, default: true }, importSuccess: { type: Boolean, default: true }, autoSave: { type: Boolean, default: true }, language: { type: String, default: "English" }, defaultSemester: { type: String, default: "" }, defaultDepartment: { type: String, default: "" }, defaultBranch: { type: String, default: "" } },
  emailVerified: { type: Boolean, default: false }, lastLogin: { type: Date, default: null }
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)
