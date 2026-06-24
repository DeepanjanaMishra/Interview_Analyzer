import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./pages/DashboardLayout";
import Interview from "./pages/Interview";
import InterviewHistory from "./pages/InterviewHistory";
import Analysis from "./pages/analysis";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="interview" element={<Interview />} />
        <Route path="analysis/:id" element={<Analysis />} />
        <Route path="history" element={<InterviewHistory />} />
      </Route>

    </Routes>
  );
}

export default App;