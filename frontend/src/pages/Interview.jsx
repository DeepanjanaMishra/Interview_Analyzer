import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

export default function Interview() {

  const [isLive, setIsLive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [stressScores, setStressScores] = useState([]);
  const [confidenceScores, setConfidenceScores] = useState([]);
  const [interviewId, setInterviewId] = useState(null);

  const [detectedEmotion, setDetectedEmotion] = useState("Analyzing...");
  const [audioEmotion, setAudioEmotion] = useState("Analyzing...");

  const [finalEmotion, setFinalEmotion] = useState("Not detected");
  const [finalAudioEmotion, setFinalAudioEmotion] = useState("Not detected");

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);

  const audioRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);

  const navigate = useNavigate();
  const emotionScoreMap = {
  happy: 85,
  calm: 80,
  neutral: 70,
  surprised: 65,
  sad: 50,
  fearful: 45,
  angry: 40,
  disgust: 35
};
const [faceHistory, setFaceHistory] = useState([]);
const [audioHistory, setAudioHistory] = useState([]);

  /* ---------------- TIMER + ML ---------------- */

  useEffect(() => {
    let timer;
    let mlLoop;

    if (isLive) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      mlLoop = setInterval(() => {
        generateScores();
        sendFrameToML();
      }, 4000);
    }

    return () => {
      clearInterval(timer);
      clearInterval(mlLoop);
    };
  }, [isLive]);

  /* ---------------- SCORES ---------------- */

  const generateScores = () => {
    setStressScores((prev) => [...prev, Math.floor(Math.random() * 40 + 40)]);
    setConfidenceScores((prev) => [...prev, Math.floor(Math.random() * 30 + 60)]);
  };

  /* ---------------- TIME ---------------- */

  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s < 10 ? "0" : ""}${s}`;
  };

  /* ---------------- FRAME ---------------- */

  const getFrameBlob = async () => {
    if (!webcamRef.current) return null;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return null;
    return await fetch(imageSrc).then(res => res.blob());
  };

  /* ---------------- FACE ML ---------------- */

  const sendFrameToML = async () => {
    try {
      const blob = await getFrameBlob();
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "frame.jpg");

      const res = await fetch("http://localhost:5001/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.emotion) {
        setDetectedEmotion(data.emotion);
        setFaceHistory(prev => [...prev, data.emotion]);
        setFinalEmotion(data.emotion);
        return data.emotion;
      }

    } catch (err) {
      console.log("Face ML error:", err);
    }
    return null;
  };

  /* ---------------- AUDIO LIVE ---------------- */
 const audioBufferRef = useRef([]);
 const intervalRef = useRef(null);

  const startAudioAnalysis = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStreamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    audioRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioBufferRef.current.push(event.data);
      }
    };

    recorder.start(1000); // collect small chunks

    // 🔥 Every 6 sec → send combined audio
    intervalRef.current = setInterval(async () => {
      if (audioBufferRef.current.length === 0) return;

      const blob = new Blob(audioBufferRef.current, { type: "audio/webm" });

      console.log("🎤 Combined size:", blob.size);

      // reset buffer
      audioBufferRef.current = [];

      if (blob.size < 5000) {
        console.log("⚠️ Too small, skipping");
        return;
      }

      const fd = new FormData();
      fd.append("audio", blob, "chunk.webm");

      try {
        const res = await fetch("http://localhost:5002/predict-audio", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();

        if (data.emotion) {
          setAudioEmotion(data.emotion);
          setAudioHistory(prev => [...prev, data.emotion]);
          setFinalAudioEmotion(data.emotion);
        }

      } catch (err) {
        console.log("Audio ML error:", err);
      }

    }, 6000); // 🔥 window size

  } catch (err) {
    console.log("Mic error:", err);
  }
};

const stopAudioAnalysis = () => {
  if (audioRecorderRef.current) {
    audioRecorderRef.current.stop();
  }

  if (audioStreamRef.current) {
    audioStreamRef.current.getTracks().forEach(track => track.stop());
  }

  if (intervalRef.current) {
    clearInterval(intervalRef.current);
  }
};
const handleStart = async () => {
  try {
    const response = await fetch("http://localhost:5000/interview/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        type: "HR",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert("Failed to start interview");
      return;
    }

    // ✅ Set state
    setInterviewId(data.interviewId);
    setIsLive(true);
    setSeconds(0);
    setStressScores([]);
    setConfidenceScores([]);

    // 🔥 START VIDEO + AUDIO RECORDING (IMPORTANT)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    audioChunksRef.current = [];
    videoChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
        videoChunksRef.current.push(event.data);
      }
    };

    recorder.start();

    // 🔥 START REAL-TIME AUDIO ANALYSIS
    await startAudioAnalysis();

  } catch (err) {
    console.log("Start error:", err);
  }
};
const calculateScore = (history) => {
  if (!history.length) return 0;

  const scores = history.map(e => emotionScoreMap[e] || 60);

  const avg =
    scores.reduce((a, b) => a + b, 0) / scores.length;

  return Math.round(avg);
};
const calculateStability = (history) => {
  if (!history || history.length < 2) return 1;

  let changes = 0;

  for (let i = 1; i < history.length; i++) {
    if (history[i] !== history[i - 1]) {
      changes++;
    }
  }

  const stability = 1 - (changes / history.length);

  return Math.max(0, Math.min(1, stability)); // keep between 0–1
};

  /* ---------------- END ---------------- */

 const handleEnd = async () => {

  stopAudioAnalysis();

  const faceScore = calculateScore(faceHistory);
  const audioScore = calculateScore(audioHistory);

  // ✅ FIRST calculate stability (IMPORTANT FIX)
  const faceStability = calculateStability(faceHistory);
  const audioStability = calculateStability(audioHistory);

  // ✅ NOW use it
  const confidence = Math.round(
    (faceScore * 0.5 + audioScore * 0.3 + (faceStability * 100) * 0.2)
  );

  const emotionScore = Math.round((faceScore + audioScore) / 2);

  const communication =
    audioScore > 75 ? 80 :
    audioScore > 60 ? 70 : 55;

  const technical = 70;

  const eyeContact =
    faceScore > 75 ? 85 :
    faceScore > 60 ? 70 : 50;

  try {

    let audioBlob = null;
    let videoBlob = null;

    if (mediaRecorderRef.current) {
      await new Promise((resolve) => {
        mediaRecorderRef.current.onstop = () => {
          audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          videoBlob = new Blob(videoChunksRef.current, { type: "video/webm" });
          resolve();
        };
        mediaRecorderRef.current.stop();
      });
    }

    const latestEmotion = await sendFrameToML();

    const finalFaceEmotion =
      latestEmotion || finalEmotion || "Not detected";

    const audioFinal =
      audioEmotion && audioEmotion !== "Analyzing..."
        ? audioEmotion
        : finalAudioEmotion || "Not detected";

    const formData = new FormData();

    if (audioBlob) formData.append("audio", audioBlob, "audio.webm");
    if (videoBlob) formData.append("video", videoBlob, "video.webm");

    formData.append("confidence", confidence);
    formData.append("emotion", emotionScore);
    formData.append("communication", communication);
    formData.append("technical", technical);
    formData.append("eyeContact", eyeContact);

    // ✅ FIXED (NOW AFTER DECLARATION)
    formData.append("faceStability", faceStability);

    formData.append("emotionLabel", finalFaceEmotion);
    formData.append("audioEmotionLabel", audioFinal);

    const response = await fetch(
      `http://localhost:5000/interview/end/${interviewId}`,
      {
        method: "PUT",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      alert("Failed to end interview");
      return;
    }

    setIsLive(false);
    navigate(`/dashboard/analysis/${interviewId}`);

  } catch (err) {
    console.log("End error:", err);
  }
};

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-white p-6">

      <h1 className="text-2xl font-semibold mb-6">
        Live Interview
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {/* Webcam */}
        <div className="col-span-2 bg-slate-100 p-4 rounded-xl">
          {isLive ? (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-[350px] object-cover rounded"
            />
          ) : (
            <p>Camera inactive</p>
          )}
        </div>

        {/* Panel */}
        <div className="space-y-4">

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Face Emotion</p>
            <p className="text-xl font-bold text-blue-600">
              {isLive ? detectedEmotion : "--"}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Voice Emotion</p>
            <p className="text-xl font-bold text-purple-600">
              {isLive ? audioEmotion : "--"}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Time</p>
            <p className="font-mono">{formatTime(seconds)}</p>
          </div>

        </div>

      </div>

      <div className="mt-6">
        {!isLive ? (
          <button
            onClick={handleStart}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Start Interview
          </button>
        ) : (
          <button
            onClick={handleEnd}
            className="bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            End Interview
          </button>
        )}
      </div>

    </div>
  );
}