import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

export default function StudentDashboard() {

  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  /* 🔥 USER NAME + GREETING */
  const userName = localStorage.getItem("userName") || "User";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" :
    hour < 18 ? "Good Afternoon" :
    "Good Evening";

  /* 🔓 LOGOUT */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* 🔁 FETCH HISTORY */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5000/interview/my", {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        const data = await res.json();

        // ✅ ensure array
        setHistory(Array.isArray(data) ? data : []);

      } catch (err) {
        console.log("Fetch error");
      }
    };

    fetchHistory();
  }, []);

  const studentHistory = history;
  const latest = studentHistory[0] || {};

  /* ✅ SAFE CALCULATIONS */

  const totalSessions = studentHistory.length;

  const averageScore =
    totalSessions > 0
      ? Math.round(
          studentHistory.reduce(
            (sum, item) => sum + (item.scores?.overall || 0),
            0
          ) / totalSessions
        )
      : 0;

  const bestScore =
    totalSessions > 0
      ? Math.max(...studentHistory.map(i => i.scores?.overall || 0))
      : 0;

  /* 📊 GRAPH DATA */

  const lineData = studentHistory.map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString(),
    score: item.scores?.overall || 0,
  }));

  const barData = [
    { name: "Confidence", value: latest?.scores?.confidence || 0 },
    { name: "Communication", value: latest?.scores?.communication || 0 },
    { name: "Technical", value: latest?.scores?.technical || 0 },
    { name: "Eye Contact", value: latest?.scores?.eyeContact || 0 },
  ];

  const emotionData = studentHistory.map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString(),
    emotion: item.scores?.emotion || 0,
  }));

  return (
    <div className="space-y-8 p-6 bg-slate-100 min-h-screen">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {greeting}, {userName} 👋
          </h1>

          <p className="text-slate-500 mt-1">
            Track your performance and improve your interview skills 🚀
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard/interview")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow"
          >
            Start Interview
          </button>

          <button
            onClick={() => navigate("/dashboard/history")}
            className="bg-white border px-5 py-2 rounded-lg hover:bg-slate-200 transition"
          >
            View History
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition shadow"
          >
            Logout
          </button>
        </div>

      </div>

      {/* 📊 KPI CARDS */}
      <div className="grid grid-cols-3 gap-6">

        <Card title="Total Sessions" value={totalSessions} />

        <Card title="Average Score" value={`${averageScore}%`} />

        <Card title="Best Score" value={`${bestScore}%`} />

      </div>

      {/* 📈 PERFORMANCE TREND */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
        <h2 className="text-lg font-semibold mb-4">
          📈 Performance Trend
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 SKILL BREAKDOWN */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
        <h2 className="text-lg font-semibold mb-4">
          📊 Skill Breakdown
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🎭 EMOTION TREND */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
        <h2 className="text-lg font-semibold mb-4">
          🎭 Emotion Trend (Stress Levels)
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={emotionData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="emotion" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

/* 🔹 CARD COMPONENT */
function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
      <p className="text-slate-500 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-2 text-slate-900">
        {value}
      </p>
    </div>
  );
}