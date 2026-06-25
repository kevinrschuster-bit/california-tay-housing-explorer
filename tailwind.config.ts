import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  safelist: [
    "border-indigo-200",
    "border-sky-200",
    "border-emerald-200",
    "border-amber-200",
    "border-slate-200",
    "bg-indigo-50",
    "bg-indigo-500",
    "bg-indigo-600",
    "bg-sky-50",
    "bg-sky-500",
    "bg-emerald-50",
    "bg-emerald-500",
    "bg-amber-50",
    "bg-amber-500",
    "bg-slate-50",
    "bg-slate-400",
    "bg-slate-500",
    "text-indigo-700",
    "text-sky-700",
    "text-emerald-700",
    "text-amber-800",
    "text-slate-700"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        moss: "#047857",
        clay: "#b45309",
        skyglass: "#e0f2fe",
        linen: "#f8fafc"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
