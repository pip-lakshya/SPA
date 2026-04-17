const mongoose = require("mongoose")

const subjectDomainOverrideSchema = new mongoose.Schema(
  {
    normalized: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    domain: {
      type: String,
      required: true,
      trim: true
    },
    count: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true,
    collection: "subject_domain_overrides"
  }
)

module.exports = mongoose.model("SubjectDomainOverride", subjectDomainOverrideSchema)
