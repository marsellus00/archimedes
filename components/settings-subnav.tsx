import Link from "next/link";
import {
  CreditCard,
  Puzzle,
  Shield,
  SlidersHorizontal,
  User,
} from "lucide-react";

type SettingsSubnavProps = {
  active: "profile" | "preferences" | "security" | "integrations" | "billing";
};

const items = [
  { key: "profile", label: "Profile", href: "/settings/user", icon: User },
  {
    key: "preferences",
    label: "Preferences",
    href: "/settings/preferences",
    icon: SlidersHorizontal,
  },
  { key: "security", label: "Security", href: "/settings/security", icon: Shield },
  {
    key: "integrations",
    label: "Integrations",
    href: "/settings/integrations",
    icon: Puzzle,
  },
  { key: "billing", label: "Billing", href: "/settings/billing", icon: CreditCard },
] as const;

export function SettingsSubnav({ active }: SettingsSubnavProps) {
  return (
    <aside className="h-fit rounded-2xl border border-slate-700/30 bg-[#161b22] p-4">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-sky-300">Settings</h3>
        <p className="text-xs text-slate-500">System Configuration</p>
      </div>

      <div className="flex flex-col space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-[#2a2f38] text-sky-300"
                  : "text-slate-400 hover:bg-[#1c222b]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}