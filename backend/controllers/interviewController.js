const Interview = require("../models/Interview");

/* ---------------- START INTERVIEW ---------------- */

exports.startInterview = async (req, res) => {
  try {
    const { type } = req.body;

    const interview = await Interview.create({
      candidateId: req.user.id,
      type,
      startTime: new Date(),
    });

    res.status(201).json({
      message: "Interview started",
      interviewId: interview._id,
    });

  } catch (error) {
    console.error("Start interview error:", error);

    res.status(500).json({
      message: "Failed to start interview",
      error: error.message,
    });
  }
};

/* ---------------- END INTERVIEW ---------------- */

exports.endInterview = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📦 BODY RECEIVED:", req.body);
    console.log("📁 FILES RECEIVED:", req.files);

    let {
      confidence,
      communication,
      emotion,
      technical,
      eyeContact,
      strengths,
      improvements,
      summary,
      emotionLabel,
      audioEmotionLabel,
      faceStability,
    } = req.body;

    // 🔥 DEBUG LOG
    console.log("🔥 SAVING:", {
      faceEmotion: emotionLabel,
      audioEmotion: audioEmotionLabel
    });

    /* ---------------- SAFE PARSING ---------------- */

    confidence = Number(confidence) || 0;
    communication = Number(communication) || 0;
    emotion = Number(emotion) || 0;
    technical = Number(technical) || 70;
    eyeContact = Number(eyeContact) || 65;

    const overall = Math.round(
      (confidence + communication + emotion + technical + eyeContact) / 5
    );

    /* ---------------- FILE HANDLING ---------------- */

    const audioFile = req.files?.audio?.[0];
    const videoFile = req.files?.video?.[0];

    console.log("🎧 AUDIO FILE:", audioFile?.path);
    console.log("🎥 VIDEO FILE:", videoFile?.path);

    /* ---------------- CLEAN EMOTION VALUES ---------------- */

    const cleanFaceEmotion =
      typeof emotionLabel === "string" &&
      emotionLabel.trim() !== "" &&
      emotionLabel.trim().toLowerCase() !== "analyzing..."
        ? emotionLabel.trim()
        : "Not detected";

    const cleanAudioEmotion =
      typeof audioEmotionLabel === "string" &&
      audioEmotionLabel.trim() !== "" &&
      audioEmotionLabel.trim().toLowerCase() !== "analyzing..."
        ? audioEmotionLabel.trim()
        : "Not detected";

    console.log("✅ CLEANED:", {
      face: cleanFaceEmotion,
      audio: cleanAudioEmotion
    });

    /* ---------------- UPDATE DB ---------------- */

    const interview = await Interview.findOneAndUpdate(
      {
        _id: id,
        candidateId: req.user.id,
      },
      {
        endTime: new Date(),

        scores: {
          confidence,
          communication,
          emotion,
          technical,
          eyeContact,
          overall,
        },
        faceStability: Number(faceStability) || 1,

        strengths: strengths
          ? Array.isArray(strengths) ? strengths : [strengths]
          : ["Good confidence", "Clear communication"],

        improvements: improvements
          ? Array.isArray(improvements) ? improvements : [improvements]
          : ["Improve eye contact", "Reduce hesitation"],

        audioUrl: audioFile ? audioFile.path : "",
        videoUrl: videoFile ? videoFile.path : "",

        // ✅ FIXED FIELDS
        faceEmotion: cleanFaceEmotion,
        audioEmotion: cleanAudioEmotion,

        summary:
          summary ||
          "You performed well overall. Focus on improving eye contact and technical clarity.",
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    console.log("🎯 FINAL SAVED DATA:", {
      faceEmotion: interview.faceEmotion,
      audioEmotion: interview.audioEmotion
    });

    res.json({
      message: "Interview ended and analysis saved",
      interview,
    });

  } catch (error) {
    console.error("❌ End interview error:", error);

    res.status(500).json({
      message: "Failed to end interview",
      error: error.message,
    });
  }
};

/* ---------------- GET MY INTERVIEWS ---------------- */

exports.getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      candidateId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(interviews);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch interviews",
      error: error.message,
    });
  }
};

/* ---------------- GET INTERVIEW BY ID ---------------- */

exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    console.log("📊 FETCHED INTERVIEW:", {
      faceEmotion: interview?.faceEmotion,
      audioEmotion: interview?.audioEmotion
    });

    res.json(interview);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch interview",
      error: error.message,
    });
  }
};