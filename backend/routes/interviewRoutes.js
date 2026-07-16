const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  startInterview,
  endInterview,
  getMyInterviews,
  getInterviewById
} = require("../controllers/interviewController");

/* ---------------- START INTERVIEW ---------------- */
router.post("/start", authMiddleware, startInterview);

/* ---------------- END INTERVIEW (WITH FILE UPLOAD) ---------------- */
router.put(
  "/end/:id",
  authMiddleware,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  endInterview
);

/* ---------------- GET MY INTERVIEWS ---------------- */
router.get("/my", authMiddleware, getMyInterviews);

/* ---------------- GET INTERVIEW BY ID ---------------- */
router.get("/:id", authMiddleware, getInterviewById);

module.exports = router;