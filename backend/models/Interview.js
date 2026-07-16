const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    /* -------- USER -------- */

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* -------- INTERVIEW TYPE -------- */

    type: {
      type: String,
      enum: ["HR", "Tech", "Mixed"],
      required: true,
    },

    /* -------- TIMESTAMPS -------- */

    startTime: {
      type: Date,
      default: Date.now,
    },

    endTime: {
      type: Date,
    },

    /* -------- MEDIA -------- */

    audioUrl: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    /* -------- EMOTION OUTPUTS -------- */

    faceEmotion: {
      type: String,
      default: "Not detected",
    },

    audioEmotion: {
      type: String,
      default: "Not detected",
    },

    /* -------- SCORES -------- */

    scores: {
      confidence: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      emotion: { type: Number, default: 0 }, // numeric score
      technical: { type: Number, default: 0 },
      eyeContact: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },

    /* -------- FEEDBACK -------- */

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    summary: {
      type: String,
      default: "",
    },

    /* -------- ADVANCED ML (FUTURE READY) -------- */

    emotionAnalysis: {
      dominant: { type: String, default: "" },
      distribution: { type: Object, default: {} },
      stability: { type: Number, default: 0 },
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);