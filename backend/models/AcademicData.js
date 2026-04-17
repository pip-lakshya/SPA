const mongoose = require("mongoose")

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    domain: {
      type: String,
      required: true,
      trim: true
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  { _id: false }
)

const semesterSchema = new mongoose.Schema(
  {
    semester: {
      type: String,
      required: true,
      trim: true
    },
    sgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    subjects: {
      type: [subjectSchema],
      default: []
    }
  },
  { _id: false }
)

const domainAveragesSchema = new mongoose.Schema(
  {
    Mathematics: {
      type: Number,
      default: 0
    },
    CoreEngineering: {
      type: Number,
      default: 0
    },
    CS_IT: {
      type: Number,
      default: 0
    },
    AI_DS_IT: {
      type: Number,
      default: 0
    },
    Electronics: {
      type: Number,
      default: 0
    },
    Mechanical_Civil: {
      type: Number,
      default: 0
    },
    AI_DS: {
      type: Number,
      default: 0
    },
    Management: {
      type: Number,
      default: 0
    },
    General: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
)

const academicDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    branch: {
      type: String,
      required: true,
      trim: true
    },
    semesters: {
      type: [semesterSchema],
      default: []
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    overallAverage: {
      type: Number,
      default: 0
    },
    domainAverages: {
      type: domainAveragesSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("AcademicData", academicDataSchema)
