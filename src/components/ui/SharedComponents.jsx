import { Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({ icon: Icon, label, value, change, color = 'primary', gradient }) {
  const colorMap = {
    primary: { 
      bg: 'rgba(59,130,246,0.12)', 
      text: 'text-blue-400', 
      border: 'rgba(59,130,246,0.3)',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]'
    },
    success: { 
      bg: 'rgba(16,185,129,0.12)', 
      text: 'text-emerald-400', 
      border: 'rgba(16,185,129,0.3)',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
    },
    warning: { 
      bg: 'rgba(245,158,11,0.12)', 
      text: 'text-amber-400', 
      border: 'rgba(245,158,11,0.3)',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]'
    },
    danger: { 
      bg: 'rgba(239,68,68,0.12)', 
      text: 'text-red-400', 
      border: 'rgba(239,68,68,0.3)',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]'
    },
    info: { 
      bg: 'rgba(6,182,212,0.12)', 
      text: 'text-cyan-400', 
      border: 'rgba(6,182,212,0.3)',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]'
    },
    purple: { 
      bg: 'rgba(139,92,246,0.12)', 
      text: 'text-purple-400', 
      border: 'rgba(139,92,246,0.3)',
      glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]'
    },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`stat-card glass-card-interactive group relative ${c.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-white tracking-tight font-['Outfit'] group-hover:scale-105 transition-transform origin-left">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
                change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {change.startsWith('+') ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {change}
              </span>
              <span className="text-[11px] text-[#8b949e]">vs last week</span>
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <Icon size={22} className={c.text} />
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-[#21262d]/50">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-['Outfit'] flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm text-[#8b949e] mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}

export function SectionCard({ title, subtitle, children, action, padding = true }) {
  return (
    <div className="section-card">
      {(title || action) && (
        <div className={`flex items-center justify-between ${padding ? 'px-6' : 'px-4'} py-4 border-b border-[#21262d] bg-[#161b22]/50`}>
          <div>
            {title && <h3 className="font-bold text-white text-sm tracking-wide font-['Outfit']">{title}</h3>}
            {subtitle && <p className="text-xs text-[#8b949e] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizeMap = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full ${sizeMap[size]} section-card shadow-2xl fade-in border border-[#30363d]`}>
        <div className="flex items-center justify-between p-5 border-b border-[#21262d] bg-[#161b22]">
          <h3 className="font-bold text-white text-base font-['Outfit']">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#484f58]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input pl-10 w-full text-xs"
      />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
        <Icon size={26} className="text-blue-400" />
      </div>
      <h3 className="text-base font-bold text-white mb-1 font-['Outfit']">{title}</h3>
      <p className="text-xs text-[#8b949e] max-w-sm">{description}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="skeleton h-3 w-20 mb-3 rounded" />
          <div className="skeleton h-8 w-16 mb-2 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="skeleton w-12 h-12 rounded-2xl" />
      </div>
    </div>
  );
}

export function StatusDot({ status }) {
  const colors = {
    active: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    inactive: 'bg-[#484f58]',
    maintenance: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
    in_progress: 'bg-blue-400 shadow-[0_0_8px_#3b82f6]',
    pending: 'bg-yellow-400 shadow-[0_0_8px_#eab308]',
    resolved: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    completed: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    scheduled: 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]',
  };
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-[#484f58]'} mr-2`} />
  );
}
