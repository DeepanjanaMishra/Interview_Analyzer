import { NavLink } from "react-router-dom"
import { useMode } from "../context/ModeContext"

export default function Sidebar() {
 const { mode, switchMode } = useMode()
const role = localStorage.getItem("primaryRole")

  return (
    <aside className="w-64 min-h-screen border-r border-slate-200 bg-white p-6">

      <h1 className="text-xl font-semibold mb-8">
        Interview
      </h1>

      <nav className="space-y-4">

        <NavLink
  to="/dashboard"
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md ${
      isActive
        ? "bg-blue-50 text-blue-600 font-medium"
        : "text-slate-600 hover:bg-slate-100"
    }`
  }
>
  <span>🏠</span>
  <span>Dashboard</span>
</NavLink>


        <NavLink
  to="/dashboard/interview"
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md ${
      isActive
        ? "bg-blue-50 text-blue-600 font-medium"
        : "text-slate-600 hover:bg-slate-100"
    }`
  }
>
  <span>🎥</span>
  <span>New Interview</span>
</NavLink>


      <NavLink
  to="/dashboard/history"
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md ${
      isActive
        ? "bg-blue-50 text-blue-600 font-medium"
        : "text-slate-600 hover:bg-slate-100"
    }`
  }
>
  <span>📁</span>
  <span>Interview History</span>
</NavLink>


        {role === "recruiter" && mode === "recruiter" && (
  <button
    onClick={() => switchMode("student")}
    className="mt-6 flex items-center gap-2 text-sm text-blue-600 hover:underline"
  >
    🔄 Switch to Practice Mode
  </button>
)}

{role === "recruiter" && mode === "student" && (
  <button
    onClick={() => switchMode("recruiter")}
    className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:underline"
  >
    🔁 Back to Recruiter Mode
  </button>
)}


      </nav>
    </aside>
  )
}
