import { Bus, MapPin, Clock, Navigation, Bell, QrCode, CheckCircle, AlertCircle, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageHeader, SectionCard, StatCard } from '../../components/ui/SharedComponents';
import { useAuth } from '../../context/AuthContext';
import { mockAttendance, mockNotifications, mockSchedules, mockStops } from '../../data/mockData';

export default function StudentDashboard() {
  const { user } = useAuth();
  const mySchedule = mockSchedules.filter(s => s.bus === user?.busAssigned);
  const unreadNotifs = mockNotifications.filter(n => !n.read);

  return (
    <div className="page-container p-4 lg:p-6 fade-in space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`}
        subtitle={`${user?.department || 'Computer Science & Engineering'} · ID: ${user?.studentId || 'CSE-2020-001'} · Year 4`}
        action={
          <a href="/buspass" className="btn btn-primary btn-sm shadow-lg shadow-blue-600/30">
            <QrCode size={15} /> Digital Bus Pass
          </a>
        }
      />

      {/* Dynamic Active Bus Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 via-purple-950/50 to-slate-900/80 border border-amber-500/30 relative overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-700 pointer-events-none" style={{ backgroundImage: "url('/nstu_bus_hero_dark.png')" }} />
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              <Bus size={30} className="text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles size={12} className="animate-pulse text-amber-400" /> Assigned Bus Telemetry
              </div>
              <div className="text-3xl font-extrabold text-white font-['Outfit']">{user?.busAssigned || 'NSTU-01'}</div>
              <div className="text-xs text-[#94a3b8] font-medium">{user?.routeAssigned || 'Route A - NSTU Campus Express'}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-[#0d162a]/90 p-3.5 rounded-2xl border border-amber-500/20 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold text-emerald-400">GPS Live</span>
            </div>

            <div className="text-right pl-2 border-l border-[#1e293b]">
              <div className="text-sm text-white font-extrabold font-mono">ETA: 8 min</div>
              <div className="text-[11px] text-[#94a3b8]">Approaching Main Gate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MapPin} label="Assigned Stop" value="Ambarkhana" color="primary" />
        <StatCard icon={Clock} label="Next Departure" value="8:22 AM" color="success" />
        <StatCard icon={CheckCircle} label="Attendance Rate" value="92%" color="info" />
        <StatCard icon={Bell} label="System Alerts" value={unreadNotifs.length} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Radar Tracker Box */}
        <div className="lg:col-span-2">
          <SectionCard 
            title="Real-Time Bus Tracking" 
            subtitle="Live position stream for your assigned bus" 
            action={<a href="/tracking" className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">Full Map Radar <ArrowRight size={13} /></a>}
          >
            <div className="map-placeholder h-72 rounded-2xl relative p-6 flex flex-col justify-between">
              <div className="relative z-10 text-center my-auto">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center mx-auto mb-3 shadow-[0_0_25px_rgba(59,130,246,0.3)]">
                  <Navigation size={28} className="text-blue-400 animate-bounce" />
                </div>
                <div className="text-white font-extrabold text-lg font-['Outfit'] mb-0.5">{user?.busAssigned || 'NSTU-01'} is approaching Ambarkhana</div>
                <div className="text-xs text-[#8b949e] mb-4">Telemetry Speed: <span className="text-white font-mono font-bold">42 km/h</span> · Distance: <span className="text-blue-400 font-bold">3.2 km</span></div>
                
                <div className="flex items-center justify-center gap-4 text-xs max-w-md mx-auto">
                  {mockStops.slice(0, 4).map((stop, i) => (
                    <div key={stop.id} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                        i < 2 ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_10px_#10b981]' : 
                        i === 2 ? 'bg-blue-400 border-blue-400 animate-ping shadow-[0_0_12px_#3b82f6]' : 
                        'bg-[#30363d] border-[#484f58]'
                      }`} />
                      <span className={`text-[10px] font-bold ${i < 2 ? 'text-emerald-400' : i === 2 ? 'text-blue-400' : 'text-[#484f58]'} truncate max-w-[70px]`}>
                        {stop.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Today's schedule + quick action shortcuts */}
        <div className="space-y-6">
          <SectionCard title="Today's Timetable">
            <div className="space-y-3">
              {mySchedule.map(s => (
                <div key={s.id} className={`p-3.5 rounded-2xl border transition-all ${
                  s.type === 'morning' 
                    ? 'bg-amber-500/10 border-amber-500/20' 
                    : 'bg-indigo-500/10 border-indigo-500/20'
                }`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${s.type === 'morning' ? 'text-amber-400' : 'text-indigo-400'}`}>
                    {s.type} Shift Departure
                  </div>
                  <div className="text-base font-extrabold text-white font-['Outfit']">{s.departure} → {s.arrival}</div>
                  <div className="text-xs text-[#8b949e] mt-1">{s.route}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Quick Portal Shortcuts">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: QrCode, label: 'Bus Pass', path: '/buspass', color: 'from-blue-600/20 to-purple-600/20 border-blue-500/30' },
                { icon: Navigation, label: 'Track Bus', path: '/tracking', color: 'from-emerald-600/20 to-cyan-600/20 border-emerald-500/30' },
                { icon: AlertCircle, label: 'Report Issue', path: '/complaints', color: 'from-red-600/20 to-orange-600/20 border-red-500/30' },
                { icon: CheckCircle, label: 'Attendance', path: '/attendance', color: 'from-amber-600/20 to-yellow-600/20 border-amber-500/30' },
              ].map(a => (
                <a 
                  key={a.label} 
                  href={a.path} 
                  className={`p-3.5 rounded-2xl bg-gradient-to-br ${a.color} border flex flex-col items-center justify-center gap-1.5 hover:scale-[1.04] transition-all shadow-md group`}
                >
                  <a.icon size={20} className="text-white group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white">{a.label}</span>
                </a>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Notifications list */}
      <SectionCard title="Recent Announcements" action={<a href="/notifications" className="text-xs text-blue-400 font-semibold">View all →</a>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mockNotifications.slice(0, 4).map(n => (
            <div key={n.id} className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
              !n.read ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[#0d1117]/80 border-[#21262d]'
            }`}>
              <div className="p-2 rounded-xl bg-[#161b22] border border-[#21262d] flex-shrink-0">
                <Bell size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white font-['Outfit']">{n.title}</div>
                <div className="text-xs text-[#8b949e] mt-1 leading-relaxed">{n.message}</div>
                <div className="text-[10px] font-mono text-[#484f58] mt-1.5">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
