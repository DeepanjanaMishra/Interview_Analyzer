import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Analysis() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/interview/${id}`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        const data = await response.json();
        const finalData = data.interview || data;

        setInterview(finalData);
        console.log("🔥 ANALYSIS DATA:", finalData);

      } catch (error) {
        console.log("Failed to fetch interview");
      }
    };

    fetchInterview();
  }, [id]);

  if (!interview) {
    return <div className="p-8 text-center">Loading analysis...</div>;
  }

  const scores = interview.scores || {};

  const faceEmotion =
    interview.faceEmotion && interview.faceEmotion !== "Not detected"
      ? interview.faceEmotion.toLowerCase()
      : "not detected";

  const audioEmotion =
    interview.audioEmotion && interview.audioEmotion !== "Not detected"
      ? interview.audioEmotion.toLowerCase()
      : "not detected";

  /* 🔥 DYNAMIC FEEDBACK */
  const faceStability = interview.faceStability || 1;

  const strengths = [];
  const improvements = [];

  if (scores.confidence > 75) strengths.push("Confident delivery");
  else improvements.push("Be more confident");

  if (scores.communication > 70) strengths.push("Clear communication");
  else improvements.push("Improve clarity");

  if (scores.technical > 75) strengths.push("Strong technical answers");
  else improvements.push("Revise core concepts");

  if (scores.eyeContact > 70) strengths.push("Good eye contact");
  else improvements.push("Maintain eye contact");

  if (faceEmotion === "happy" || faceEmotion === "calm") {
    strengths.push("Positive facial cues");
  }

  if (faceEmotion === "angry" || faceEmotion === "sad") {
    improvements.push("Control facial expressions");
  }
  if (faceStability < 0.5) {
  improvements.push("Maintain consistent expressions");
  }
  if (audioEmotion === "calm") {
    strengths.push("Stable voice tone");
  }

  if (audioEmotion === "fearful" || audioEmotion === "angry") {
    improvements.push("Reduce voice stress");
  }

  /* 🔥 SMART SUMMARY */

  const summary = `
You showed ${scores.confidence > 70 ? "good confidence" : "some hesitation"} 
and ${scores.communication > 70 ? "clear communication" : "scope for improvement in communication"}.
Focus on ${scores.technical > 70 ? "refining delivery" : "strengthening concepts"} 
for better performance.
`;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-center text-slate-800">
        Interview Analysis Report
      </h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 flex justify-center">
        <CircularScore score={scores.overall || 0} />
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Skill Breakdown
        </h2>

        <SkillBar label="Confidence" value={scores.confidence || 0} />
        <SkillBar label="Communication" value={scores.communication || 0} />
        <SkillBar label="Technical" value={scores.technical || 70} />
        <SkillBar label="Eye Contact" value={scores.eyeContact || 65} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <EmotionCard title="Facial Emotion" value={faceEmotion} color="blue" />
        <EmotionCard title="Voice Emotion" value={audioEmotion} color="purple" />
      </div>

      {interview.videoUrl && (
        <MediaCard title="Recorded Video">
          <video controls className="w-full rounded-lg"
            src={`http://localhost:5000/${interview.videoUrl}`} />
        </MediaCard>
      )}

      {interview.audioUrl && (
        <MediaCard title="Recorded Audio">
          <audio controls className="w-full"
            src={`http://localhost:5000/${interview.audioUrl}`} />
        </MediaCard>
      )}

      <ListCard title="Strengths" color="green" items={strengths} icon="✅" />
      <ListCard title="Improvements" color="red" items={improvements} icon="⚠️" />

      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">AI Summary</h2>
        <p className="text-slate-600">{summary}</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate("/dashboard/history")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow"
        >
          View History
        </button>
      </div>

    </div>
  );
}

/* 🔥 UPDATED SKILL BAR */
function SkillBar({ label, value }) {

  const descriptions = {
    Confidence: "Posture & response stability",
    Communication: "Speech clarity & flow",
    Technical: "Answer accuracy",
    "Eye Contact": "Focus & engagement"
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <p className="text-xs text-gray-400 mb-1">
        {descriptions[label]}
      </p>

      <div className="w-full bg-gray-200 h-3 rounded">
        <div className="bg-blue-500 h-3 rounded"
          style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/* FIXED TAILWIND BUG */
function EmotionCard({ title, value, color }) {

  const colorClass =
    color === "blue" ? "text-blue-600" :
    color === "purple" ? "text-purple-600" : "text-gray-600";

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <div className={`flex items-center gap-3 ${colorClass} text-xl font-semibold`}>
        <span className="text-3xl">
          {value === "not detected" ? "⚠️" : getEmotionEmoji(value)}
        </span>
        {value}
      </div>
    </div>
  );
}

function MediaCard({ title, children }) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

function ListCard({ title, color, items, icon }) {

  const colorClass =
    color === "green" ? "text-green-600" :
    color === "red" ? "text-red-600" : "text-gray-600";

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6">
      <h2 className={`text-xl font-semibold ${colorClass} mb-2`}>
        {title}
      </h2>

      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index}>{icon} {item}</li>
        ))}
      </ul>
    </div>
  );
}

function CircularScore({ score }) {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle stroke="#e5e7eb" fill="transparent"
          strokeWidth={stroke} r={normalizedRadius}
          cx={radius} cy={radius} />
        <circle stroke="#2563eb" fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius} cy={radius} />
        <text x="50%" y="50%" dominantBaseline="middle"
          textAnchor="middle" fontSize="20" fontWeight="bold">
          {score}%
        </text>
      </svg>
      <p className="mt-2 font-semibold">Overall Score</p>
    </div>
  );
}

function getEmotionEmoji(emotion) {
  const map = {
    happy: "😄",
    sad: "😢",
    angry: "😠",
    fearful: "😨",
    surprised: "😲",
    neutral: "😐",
    disgust: "🤢",
    calm: "😌"
  };
  return map[emotion] || "🙂";
}