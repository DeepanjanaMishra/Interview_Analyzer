import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4">
        <h1 className="text-xl font-bold text-blue-600">
          Interview_Analyzer
        </h1>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-slate-700 hover:text-blue-600 transition"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center text-center px-6 mt-16">

        <h1 className="text-5xl font-bold text-slate-900 leading-tight max-w-3xl">
          AI-Powered Interview Analysis <br />
          <span className="text-blue-600">
            That Understands You
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          Analyze your interview performance using facial expressions,
          voice emotions, and behavioral insights — all in real time.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate("/signup")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition shadow-md"
          >
            Get Started 🚀
          </button>

          <button
            onClick={() => navigate("/login")}
            className="border border-slate-300 px-8 py-3 rounded-lg text-lg hover:bg-slate-100 transition"
          >
            Login
          </button>
        </div>

      </div>

      {/* FEATURES SECTION */}
      <div className="mt-20 px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        <FeatureCard
          title="🎥 Facial Emotion Detection"
          desc="Detect real-time emotions like happy, nervous, or confident using deep learning models."
        />

        <FeatureCard
          title="🎤 Voice Emotion Analysis"
          desc="Analyze tone, pitch, and stress levels using advanced audio-based AI models."
        />

        <FeatureCard
          title="📊 Smart Performance Insights"
          desc="Get detailed reports with confidence scores, strengths, and improvements."
        />

      </div>

      {/* CTA SECTION */}
      <div className="mt-20 mb-16 text-center">

        <h2 className="text-3xl font-semibold text-slate-900">
          Ready to improve your interviews?
        </h2>

        <p className="text-slate-500 mt-2">
          Start practicing with AI-driven feedback today.
        </p>

        <button
          onClick={() => navigate("/signup")}
          className="mt-6 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition shadow-md"
        >
          Start Now
        </button>

      </div>

    </div>
  );
}

/* 🔥 FEATURE CARD */
function FeatureCard({ title, desc }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        {title}
      </h3>
      <p className="text-slate-500 text-sm">
        {desc}
      </p>
    </div>
  );
}