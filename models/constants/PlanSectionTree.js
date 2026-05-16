const PERSPECTIVES = ["catalysts", "enablers", "beneficiary", "stakeholders"]

const sectionFields = {
  perspective: {
    type: String,
    enum: PERSPECTIVES,
    required: true,
  },
  sectionKey: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  sectionTitle: {
    type: String,
    required: true,
    trim: true,
  },
}

const subSectionFields = {
  subSection: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  subSectionTitle: {
    type: String,
    default: "",
    trim: true,
  },
}

module.exports = { PERSPECTIVES, sectionFields, subSectionFields }