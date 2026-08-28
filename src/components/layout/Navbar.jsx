import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Search, Menu, Settings, User, ChevronDown, LogOut, X, Wifi, Radio, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';

export default function Navbar({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const unread = mockNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const notifColors = {
    delay: 'text-amber-400',
    maintenance: 'text-orange-400',
    announcement: 'text-blue-400',
    emergency: 'text-red-400',
  };

  return (
    <header className="sticky top-0 z-20 bg-[#070d1a]/85 backdrop-blur-2xl border-b border-amber-500/20 px-4 lg:px-6 h-16 flex items-center justify-between shadow-xl">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#0f172a] transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-400 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="tracking-wide">NSTU GPS TELEMETRY LIVE</span>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#94a3b8] bg-[#0d162a] px-3.5 py-1.5 rounded-xl border border-amber-500/20">
          <Clock size={13} className="text-amber-400" />
          <span className="font-mono text-white font-bold">{timeStr || '08:48:48 PM'}</span>
        </div>
      </div>

      {/* Center Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={15} className="absolute left-3.5 text-[#64748b]" />
        <input
          type="text"
          placeholder="Search bus, route, driver, student pass..."
          className="bg-[#0d162a]/90 border border-amber-500/25 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 w-72 lg:w-96 transition-all shadow-inner"
        />
        <span className="absolute right-3 text-[10px] font-bold text-amber-400/90 bg-[#070d1a] px-1.5 py-0.5 rounded border border-amber-500/20">⌘K</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Switch (Icon Only) */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center group shadow-md ${
            isDark 
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25' 
              : 'bg-amber-100/80 border-amber-300 text-amber-700 hover:bg-amber-200'
          }`}
          title={isDark ? 'Switch to White Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun size={19} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon size={19} className="text-amber-600 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2.5 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#0d162a] border border-transparent hover:border-amber-500/30 transition-all duration-200"
            title="Notifications"
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="notification-dot flex items-center justify-center text-[9px] font-bold text-white w-4 h-4 -top-0.5 -right-0.5 animate-pulse bg-amber-500">
                {unread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 lg:w-96 section-card shadow-2xl fade-in z-50 border border-amber-500/30">
              <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0d162a]">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-amber-400" />
                  <span className="font-bold text-white text-sm font-['Outfit']">Notifications</span>
                  <span className="badge badge-amber text-[10px]">{unread} unread</span>
                </div>
                <button onClick={() => setShowNotifications(false)} className="text-[#94a3b8] hover:text-white transition-colors">
                  <X size={15} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#1e293b]">
                {mockNotifications.map(n => (
                  <div key={n.id} className={`p-4 hover:bg-white/[0.03] transition-colors ${!n.read ? 'bg-amber-500/5' : ''}`}>
                    <div className="flex gap-3">
                      <div className="p-1.5 rounded-lg bg-[#070d1a] border border-amber-500/20 h-fit">
                        <Radio size={14} className={`${notifColors[n.type] || 'text-amber-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white flex items-center justify-between font-['Outfit']">
                          <span>{n.title}</span>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                        </div>
                        <div className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-[#64748b] mt-1.5 flex items-center gap-1 font-mono">
                          <Clock size={10} /> {n.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-[#1e293b] bg-[#070d1a] text-center">
                <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-xs text-amber-400 hover:text-amber-300 font-bold">
                  View all system notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-xl bg-[#0d162a] border border-amber-500/25 hover:border-amber-400 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
              <span className="text-slate-950 font-black text-xs">{user?.name?.charAt(0)}</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white max-w-[110px] truncate leading-tight font-['Outfit']">{user?.name?.split(' ')[0]}</div>
              <div className="text-[10px] text-amber-400 capitalize font-medium">{user?.role?.replace('_', ' ')}</div>
            </div>
            <ChevronDown size={14} className="text-[#94a3b8]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-64 section-card shadow-2xl fade-in z-50 border border-amber-500/30">
              <div className="p-4 border-b border-[#1e293b] bg-gradient-to-r from-amber-950/40 to-blue-950/40">
                <div className="text-sm font-bold text-white font-['Outfit']">{user?.name}</div>
                <div className="text-xs text-[#94a3b8] truncate mt-0.5">{user?.email}</div>
                <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/30">
                  <ShieldCheck size={12} /> Verified Session
                </div>
              </div>
              <div className="p-2 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-e2e8f0 hover:bg-[#1e293b] hover:text-amber-400 transition-colors"
                >
                  <User size={15} className="text-amber-400" /> My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-e2e8f0 hover:bg-[#1e293b] hover:text-amber-400 transition-colors"
                >
                  <Settings size={15} className="text-blue-400" /> Settings
                </Link>
                <div className="border-t border-[#1e293b] my-1" />
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/15 w-full transition-colors"
                >
                  <LogOut size={15} /> Logout Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
