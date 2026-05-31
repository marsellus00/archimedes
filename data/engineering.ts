import {
  BookOpen,
  Bot,
  Calculator,
  Database,
  Gauge,
  Home,
  Settings,
  Waves,
  Wrench,
} from "lucide-react";

export const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
  { key: "calculators", label: "Calculators", href: "/calculators", icon: Calculator },
  { key: "assistant", label: "AI Assistant", href: "/assistant", icon: Bot },
  { key: "library", label: "Data Library", href: "/library", icon: Database },
  { key: "saved", label: "Saved Work", href: "/saved", icon: BookOpen },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
] as const;

export const calculatorCards = [
  {
    title: "Fluid Dynamics",
    subtitle: "Reynolds + pressure loss",
    meta: "Engine active",
    badge: "Phase 4",
    icon: Waves,
  },
  {
    title: "Column Buckling",
    subtitle: "Euler buckling screen",
    meta: "Engine active",
    badge: "Safety-critical",
    icon: Wrench,
  },
  {
    title: "Voltage Drop",
    subtitle: "Preliminary circuit check",
    meta: "Engine active",
    badge: "Safety-critical",
    icon: Gauge,
  },
] as const;

export const materials = [
  ["Titanium Ti-6Al-4V", "113.8", "0.342", "4430", "8.6"],
  ["Aluminium 7075-T6", "71.7", "0.330", "2810", "23.5"],
  ["Stainless Steel 304", "193.0", "0.290", "8000", "17.3"],
  ["Carbon Fiber Epoxy", "135.0", "0.280", "1600", "0.8"],
] as const;

export const thoughtCards = [
  {
    title: "Reynolds Number",
    body: [
      "Re = (ρ × v × D) / μ",
      "Re = (998 × 3 × 0.05) / 0.001002",
      "Re = 149,401.20",
      "Fully turbulent flow indicated for sample data.",
    ],
  },
  {
    title: "Pressure Drop",
    body: [
      "Using Darcy–Weisbach for proof of concept.",
      "Assume commercial steel roughness and water at room temperature.",
      "Estimated friction factor: 0.021",
      "Estimated ΔP over 20 m: 37.7 kPa",
    ],
  },
  {
    title: "Engineering Note",
    body: [
      "This PoC is UI-focused, so values are seeded sample data.",
      "Next step: connect forms to a real solver service.",
    ],
  },
] as const;


