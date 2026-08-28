import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Bus, MapPin, Calendar, Users, UserCheck, Wrench,
  ClipboardList, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  BarChart3, FileText, AlertCircle, BookUser, Route, PlayCircle, Navigation, QrCode, X, Sparkles, Sun, Moon
} from 'lucide-react';

const navItems = {
  super_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'Students', icon: BookUser, path: '/students' },
    { label: 'Drivers', icon: UserCheck, path: '/drivers' },
    { label: 'Buses', icon: Bus, path: '/buses' },
    { label: 'Routes', icon: Route, path: '/routes' },
    { label: 'Bus Stops', icon: MapPin, path: '/stops' },
    { label: 'Schedules', icon: Calendar, path: '/schedules' },
    { label: 'Live Tracking', icon: Navigation, path: '/tracking' },
    { label: 'Attendance', icon: ClipboardList, path: '/attendance' },
    { label: 'Complaints', icon: AlertCircle, path: '/complaints' },
    { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ],
  transport_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Buses', icon: Bus, path: '/buses' },
    { label: 'Drivers', icon: UserCheck, path: '/drivers' },
    { label: 'Routes', icon: Route, path: '/routes' },
    { label: 'Bus Stops', icon: MapPin, path: '/stops' },
    { label: 'Schedules', icon: Calendar, path: '/schedules' },
    { label: 'Live Tracking', icon: Navigation, path: '/tracking' },
    { label: 'Attendance', icon: ClipboardList, path: '/attendance' },
    { label: 'Complaints', icon: AlertCircle, path: '/complaints' },
    { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
  ],
  driver: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Trips', icon: PlayCircle, path: '/trips' },
    { label: 'Navigation', icon: Navigation, path: '/tracking' },
    { label: 'Student List', icon: Users, path: '/students' },
    { label: 'Attendance', icon: ClipboardList, path: '/attendance' },
    { label: 'Report Issue', icon: AlertCircle, path: '/complaints' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Live Tracking', icon: Navigation, path: '/tracking' },
    { label: 'My Schedule', icon: Calendar, path: '/schedules' },
    { label: 'Bus Pass', icon: QrCode, path: '/buspass' },
    { label: 'Attendance', icon: ClipboardList, path: '/attendance' },
    { label: 'Complaints', icon: AlertCircle, path: '/complaints' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
  ],
};

const roleLabels = {
  super_admin: 'Super Admin',
  transport_admin: 'Transport Admin',
  driver: 'Bus Driver',
  student: 'Student Rider',
};

const roleColors = {
  super_admin: 'badge-amber',
  transport_admin: 'badge-primary',
  driver: 'badge-info',
  student: 'badge-success',
};

const roleGradients = {
  super_admin: 'from-amber-500 to-amber-700',
  transport_admin: 'from-blue-600 to-indigo-700',
  driver: 'from-cyan-600 to-blue-700',
  student: 'from-emerald-600 to-teal-700',
};

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#070d1a]/95 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-amber-500/20 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.4)] relative overflow-hidden group">
            <Bus size={20} className="text-slate-950 font-bold relative z-10 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-base font-black text-white leading-tight flex items-center gap-1.5 font-['Outfit']">
                NSTU BUS <Sparkles size={12} className="text-amber-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-amber-400/90 uppercase tracking-widest font-extrabold">Tracker Portal</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-7 h-7 rounded-lg bg-[#0d162a] hover:bg-[#1e293b] border border-amber-500/20 items-center justify-center transition-all text-[#94a3b8] hover:text-white"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-7 h-7 rounded-lg bg-[#0d162a] hover:bg-[#1e293b] flex items-center justify-center transition-colors text-[#94a3b8]"
        >
          <X size={15} />
        </button>
      </div>

      {/* User Info Header */}
      {!collapsed ? (
        <div className="p-4 border-b border-amber-500/20 bg-gradient-to-br from-[#0d162a] to-[#070d1a]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${roleGradients[user?.role] || 'from-amber-500 to-amber-700'} flex items-center justify-center flex-shrink-0 shadow-md border border-white/10`}>
              <span className="text-white font-black text-sm font-['Outfit']">{user?.name?.charAt(0)}</span>
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate leading-tight font-['Outfit']">{user?.name}</div>
              <span className={`badge ${roleColors[user?.role]} text-[10px] mt-1`}>
                {roleLabels[user?.role]}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 border-b border-amber-500/20 flex justify-center">
          <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${roleGradients[user?.role] || 'from-amber-500 to-amber-700'} flex items-center justify-center shadow-md border border-white/10`} title={user?.name}>
            <span className="text-white font-black text-sm">{user?.name?.charAt(0)}</span>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className={`text-[10px] font-extrabold text-amber-400/80 uppercase tracking-widest mb-2 px-2 ${collapsed ? 'hidden' : 'block'}`}>
          Navigation
        </div>
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-xs font-bold">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-amber-500/20 space-y-1">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`sidebar-item w-full ${isDark ? 'text-amber-400 hover:bg-amber-500/15' : 'text-indigo-600 hover:bg-indigo-50'} ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? (isDark ? 'White Mode' : 'Dark Mode') : undefined}
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
          {!collapsed && <span className="text-xs font-bold">{isDark ? 'White Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={handleLogout}
          className={`sidebar-item w-full text-red-400 hover:bg-red-500/15 hover:text-red-300 ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-xs font-bold">Logout System</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#070d1a] border-r border-amber-500/20 h-screen sticky top-0 transition-all duration-300 flex-shrink-0 z-20 ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full w-[250px] bg-[#070d1a] border-r border-amber-500/20 z-40 transition-transform duration-300 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
