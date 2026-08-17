/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",   // muted blue
        ai: "#6366F1",        // indigo (AI accent)
        success: "#22C55E",   // green
        warning: "#F59E0B",   // amber
        danger: "#F97316",    // soft orange
        surface: "#F8FAFC",   // light card background
        border: "#E5E7EB"
      }
    }
  },
  plugins: [],
}
