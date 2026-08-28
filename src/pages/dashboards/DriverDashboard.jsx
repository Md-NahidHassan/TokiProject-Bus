import { useState } from 'react';
import { Bus, MapPin, Clock, Users, PlayCircle, StopCircle, Navigation, Radio, Sparkles, ShieldCheck } from 'lucide-react';
import { PageHeader, SectionCard, StatCard } from '../../components/ui/SharedComponents';
import { useAuth } from '../../context/AuthContext';
import { mockStudents, mockSchedules } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [tripActive, setTripActive] = useState(false);

  const myStudents = mockStudents.filter(s => s.bus === user?.busAssigned);
  const mySchedule = mockSchedules.filter(s => s.bus === user?.busAssigned);

  const handleStartTrip = () => {
    setTripActive(true);
    toast.success('Trip started! Live GPS telemetry is broadcasting.');
  };

  const handleEndTrip = () => {
    setTripActive(false);
    toast.success('Trip ended successfully!');
  };

  return (
    <div className="page-container p-4 lg:p-6 fade-in space-y-6">
      <PageHeader
        title={`Assisted Driver Portal • ${user?.name}`}
        subtitle="Live trip controller, GPS telemetry broadcast, and passenger manifest"
      />

      {/* Trip Control Banner */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden shadow-2xl ${
        tripActive
          ? 'bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/60 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
          : 'bg-[#161b22]/70 border-[#30363d]'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              tripActive ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-[#21262d] border border-[#30363d]'
            }`}>
              <Bus size={28} className={tripActive ? 'text-emerald-400 animate-pulse' : 'text-[#8b949e]'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${tripActive ? 'bg-emerald-400 animate-ping' : 'bg-[#484f58]'}`} />
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  {tripActive ? 'Active GPS Trip Broadcasting' : 'Bus Idle at Terminal'}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-white font-['Outfit'] mt-0.5">
                Bus {user?.busAssigned || 'NSTU-01'} • {user?.routeAssigned || 'Route A'}
              </div>
              <div className="text-xs text-[#8b949e]">Driver License: Verified • Fleet ID: #8820</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!tripActive ? (
              <button onClick={handleStartTrip} className="btn btn-success py-3 px-6 text-sm font-extrabold shadow-lg">
                <PlayCircle size={18} /> Broadcast & Start Trip
              </button>
            ) : (
              <button onClick={handleEndTrip} className="btn btn-danger py-3 px-6 text-sm font-extrabold shadow-lg">
                <StopCircle size={18} /> Complete & End Trip
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bus} label="Assigned Bus" value={user?.busAssigned || 'NSTU-01'} color="primary" />
        <StatCard icon={Users} label="Total Passengers" value={myStudents.length} color="success" />
        <StatCard icon={Clock} label="Today's Shifts" value="2 Shifts" color="info" />
        <StatCard icon={Navigation} label="Assigned Route" value="Route A" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <SectionCard title="Assigned Timetable Shifts">
          <div className="space-y-3">
            {mySchedule.map(s => (
              <div key={s.id} className="p-4 bg-[#0d1117]/80 rounded-2xl border border-[#21262d]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      s.type === 'morning' ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-indigo-500/15 border border-indigo-500/30'
                    }`}>
                      <Clock size={20} className={s.type === 'morning' ? 'text-amber-400' : 'text-indigo-400'} />
                    </div>
                    <div>
                      <div className="font-extrabold text-white capitalize text-sm font-['Outfit']">{s.type} Shift Loop</div>
                      <div className="text-xs text-[#8b949e]">{s.route}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-base font-extrabold text-white">{s.departure}</div>
                    <div className="text-xs text-blue-400 font-semibold">ETA Campus: {s.arrival}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Live Route Telemetry */}
        <SectionCard title="Route Navigation HUD" subtitle="Real-time map radar for current route">
          <div className="map-placeholder h-60 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Navigation size={28} className="text-blue-400 animate-bounce" />
            </div>
            <div className="text-base font-extrabold text-white font-['Outfit']">{user?.routeAssigned || 'Route A - Sylhet City to Campus'}</div>
            <div className="text-xs text-[#8b949e] mt-1">Satellite Telemetry Locked • Speed Limit: 60 km/h</div>
            {tripActive && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
                <Radio size={12} className="text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">Live GPS Signal Active</span>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Student List */}
      <SectionCard title="Assigned Student Riders Manifest" subtitle={`${myStudents.length} riders registered for this bus`}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Dept & ID</th>
                <th>Boarding Stop</th>
                <th>Attendance Rate</th>
                <th>Pass Status</th>
              </tr>
            </thead>
            <tbody>
              {myStudents.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-xs font-extrabold text-white shadow-md">
                        {s.name.charAt(0)}
                      </div>
                      <div className="font-bold text-white text-sm font-['Outfit']">{s.name}</div>
                    </div>
                  </td>
                  <td className="text-xs text-[#8b949e]">{s.dept} · <span className="font-mono">{s.studentId}</span></td>
                  <td className="text-xs text-blue-400 font-semibold">{s.stop}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#21262d] rounded-full w-20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${s.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white font-mono">{s.attendance}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
