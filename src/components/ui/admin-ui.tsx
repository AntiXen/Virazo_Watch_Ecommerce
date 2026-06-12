/**
 * Light-theme admin UI primitives.
 * Import from here instead of raw Tailwind bg-card / border-border
 * so every admin sub-page matches the white dashboard theme.
 */

export function AdminPage({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 pb-20 animate-in fade-in duration-300">{children}</div>;
}

export function AdminTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div>
      <h1 className="font-display text-3xl text-gray-900 leading-none">{children}</h1>
      {sub && <p className="text-sm text-gray-400 mt-1.5">{sub}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-black/[0.07] rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
      <h2 className="font-display text-lg text-gray-900">{title}</h2>
      {action}
    </div>
  );
}

export function FormCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-black/[0.07] rounded-2xl shadow-sm p-6 space-y-4 ${className}`}>
      {children}
    </div>
  );
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-5 py-3 text-[9px] font-black uppercase tracking-widest text-black/30 border-b border-black/[0.06] bg-black/[0.02] ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

export function Td({ children, right, mono, muted, gold, className = "" }: {
  children?: React.ReactNode; right?: boolean; mono?: boolean; muted?: boolean; gold?: boolean; className?: string;
}) {
  return (
    <td className={`px-5 py-3.5 border-b border-black/[0.04]
      ${right ? "text-right" : ""}
      ${mono ? "font-mono text-[11px] text-gray-400" : ""}
      ${muted ? "text-gray-400 text-xs" : gold ? "text-gold font-display text-base" : "text-gray-800"}
      ${className}`}>
      {children}
    </td>
  );
}

export function Badge({ children, variant = "default" }: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "gold";
}) {
  const cls = {
    default: "bg-gray-100 text-gray-500",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger:  "bg-red-50 text-red-500",
    gold:    "bg-gold/10 text-gold",
  }[variant];
  return (
    <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${cls}`}>
      {children}
    </span>
  );
}