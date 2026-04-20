import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InterviewHistory() {

  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {

    const fetchHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/interview/my",
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        const data = await response.json();
        setHistory(data);

      } catch (error) {
        console.log("Failed to fetch history");
      }
    };

    fetchHistory();

  }, []);

  /* 🎯 Emoji helper */
  const getEmoji = (emotion) => {
    const map = {
      happy: "😊",
      sad: "😔",
      angry: "😠",
      fear: "😨",
      neutral: "😐",
      surprise: "😲",
    };
    return map[emotion?.toLowerCase()] || "🧠";
  };

  return (

    <div className="p-8 max-w-5xl mx-auto">

      <h1 className="text-3xl font-semibold mb-6 text-slate-800">
        Interview History
      </h1>

      {history.length === 0 && (
        <p className="text-slate-500">
          No completed interviews yet.
        </p>
      )}

      <div className="space-y-4">

        {history.map((item) => (

          <div
            key={item._id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex justify-between items-center"
          >

            {/* LEFT SECTION */}
            <div className="space-y-1">

              <p className="text-sm text-slate-500">
                {new Date(item.startTime).toLocaleString()}
              </p>

              <p className="text-slate-800 font-medium">
                Confidence: {item.scores?.confidence ?? "--"}%
              </p>

              <p className="text-slate-800 font-medium">
                Overall: {item.scores?.overall ?? "--"}%
              </p>

              {/* 🎭 FACE EMOTION */}
              <p className="text-blue-600 font-medium">
                Face: {getEmoji(item.faceEmotion)} {item.faceEmotion || "N/A"}
              </p>

              {/* 🎤 AUDIO EMOTION */}
              <p className="text-purple-600 font-medium">
                Voice: {getEmoji(item.audioEmotion)} {item.audioEmotion || "N/A"}
              </p>

            </div>

            {/* RIGHT BUTTON */}
            <button
              onClick={() =>
                navigate(`/dashboard/analysis/${item._id}`)
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View Report
            </button>

          </div>

        ))}

      </div>

    </div>

  );
}