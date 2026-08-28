import { Bus, Users, Route, Calendar, AlertCircle, Wrench, Activity, CheckCircle, Clock, Sparkles, Radio, ShieldCheck } from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { StatCard, SectionCard, PageHeader, StatusDot } from '../../components/ui/SharedComponents';
import { mockBuses, mockStudents, mockDrivers, mockRoutes, mockComplaints, analyticsData } from '../../data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(13,17,23,0.95)',
      borderColor: '#30363d',
      borderWidth: 1,
      titleColor: '#ffffff',
      bodyColor: '#c9d1d9',
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
    },
  },
  scales: {
    x: { grid: { color: 'rgba(33,38,45,0.7)' }, ticks: { color: '#8b949e', font: { size: 11 } } },
    y: { grid: { color: 'rgba(33,38,45,0.7)' }, ticks: { color: '#8b949e', font: { size: 11 } } },
  },
};

export default function SuperAdminDashboard() {
  const activeBuses = mockBuses.filter(b => b.status === 'active').length;
  const activeStudents = mockStudents.filter(s => s.status === 'active').length;
  const activeDrivers = mockDrivers.filter(d => d.status === 'active').length;
  const pendingComplaints = mockComplaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;

  const lineData = {
    labels: analyticsData.weekly.labels,
    datasets: [{
      label: 'Daily Trips Completed',
      data: analyticsData.weekly.trips,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.15)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#60a5fa',
      pointBorderColor: '#2563eb',
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  const studentsBarData = {
    labels: analyticsData.weekly.labels,
    datasets: [{
      label: 'Student Riders',
      data: analyticsData.weekly.students,
      backgroundColor: 'rgba(139,92,246,0.75)',
      borderColor: '#8b5cf6',
      borderWidth: 1,
      borderRadius: 8,
    }],
  };

  const busStatusData = {
    labels: ['Active Fleet', 'In Maintenance', 'Inactive'],
    datasets: [{
      data: [
        mockBuses.filter(b => b.status === 'active').length,
        mockBuses.filter(b => b.status === 'maintenance').length,
        mockBuses.filter(b => b.status === 'inactive').length,
      ],
      backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)'],
      borderColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 2,
    }],
  };

  return (
    <div className="page-container p-4 lg:p-6 fade-in space-y-6">
      <PageHeader
        title="Super Admin Control Panel"
        subtitle="System-wide overview, active fleet metrics, and real-time operations"
        action={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#21262d]">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-[#c9d1d9]">System Health: 100%</span>
            </div>
            <a href="/tracking" className="btn btn-primary btn-sm shadow-lg">
              <Activity size={14} /> Live Telemetry
            </a>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bus} label="Active Fleet Buses" value={`${activeBuses}/${mockBuses.length}`} change="+1" color="primary" />
        <StatCard icon={Users} label="Registered Students" value={activeStudents} change="+12" color="success" />
        <StatCard icon={CheckCircle} label="Active Drivers" value={activeDrivers} change="0" color="info" />
        <StatCard icon={AlertCircle} label="Open Issues" value={pendingComplaints} change="-2" color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trips Chart */}
        <div className="lg:col-span-2">
          <SectionCard title="Weekly Fleet Trip Performance" subtitle="Trip count analysis per day across all routes">
            <div style={{ height: 230 }}>
              <Line data={lineData} options={chartDefaults} />
            </div>
          </SectionCard>
        </div>

        {/* Bus Status Donut */}
        <SectionCard title="Fleet Status Breakdown" subtitle="Distribution of current bus operational status">
          <div style={{ height: 180 }} className="flex items-center justify-center">
            <Doughnut
              data={busStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: '#8b949e', font: { size: 11 }, padding: 12 },
                  },
                  tooltip: chartDefaults.plugins.tooltip,
                },
                cutout: '68%',
              }}
            />
          </div>
          <div className="flex justify-around mt-4 pt-3 border-t border-[#21262d]/60">
            <div className="text-center">
              <div className="text-xl font-extrabold text-emerald-400 font-mono">{activeBuses}</div>
              <div className="text-[11px] text-[#8b949e] font-semibold">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-extrabold text-amber-400 font-mono">{mockBuses.filter(b => b.status === 'maintenance').length}</div>
              <div className="text-[11px] text-[#8b949e] font-semibold">Maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-extrabold text-red-400 font-mono">{mockBuses.filter(b => b.status === 'inactive').length}</div>
              <div className="text-[11px] text-[#8b949e] font-semibold">Inactive</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Usage Bar */}
        <div className="lg:col-span-2">
          <SectionCard title="Daily Student Ridership" subtitle="Passenger volume tracking over the current week">
            <div style={{ height: 230 }}>
              <Bar data={studentsBarData} options={chartDefaults} />
            </div>
          </SectionCard>
        </div>

        {/* Recent Activity Stream */}
        <SectionCard title="Real-Time System Log" subtitle="Live feed of operational events">
          <div className="space-y-3.5">
            {[
              { icon: Bus, text: 'NSTU-01 initiated Route A morning loop', time: '8:02 AM', color: 'text-emerald-400' },
              { icon: AlertCircle, text: 'Complaint submitted by Nafisa Rahman', time: '8:45 AM', color: 'text-amber-400' },
              { icon: Wrench, text: 'NSTU-03 dispatched to maintenance workshop', time: '9:15 AM', color: 'text-orange-400' },
              { icon: Users, text: '3 new student passes generated', time: '10:00 AM', color: 'text-blue-400' },
              { icon: Route, text: 'Route D timetable updated by Admin', time: '11:30 AM', color: 'text-purple-400' },
              { icon: CheckCircle, text: 'NSTU-01 completed Route A loop', time: '12:10 PM', color: 'text-emerald-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="p-1.5 rounded-lg bg-[#161b22] border border-[#21262d] mt-0.5">
                  <item.icon size={14} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#c9d1d9] leading-snug">{item.text}</p>
                  <p className="text-[10px] text-[#484f58] mt-0.5 font-mono">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bus Fleet Overview Table */}
        <SectionCard title="Active Fleet Overview" action={<a href="/buses" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">View all buses →</a>}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bus Code</th>
                  <th>Assigned Driver</th>
                  <th>Route</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockBuses.map(bus => (
                  <tr key={bus.id}>
                    <td>
                      <div className="font-bold text-white font-['Outfit']">{bus.busNumber}</div>
                      <div className="text-[11px] text-[#8b949e]">{bus.type} · {bus.capacity} seats</div>
                    </td>
                    <td className="text-[#8b949e] text-xs font-medium">{bus.driver}</td>
                    <td className="text-blue-400 text-xs font-semibold">{bus.route}</td>
                    <td>
                      <span className={`badge ${bus.status === 'active' ? 'badge-success' : bus.status === 'maintenance' ? 'badge-warning' : 'badge-danger'}`}>
                        <StatusDot status={bus.status} />
                        {bus.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Recent Complaints */}
        <SectionCard title="Recent Student Complaints" action={<a href="/complaints" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">View all →</a>}>
          <div className="space-y-3">
            {mockComplaints.map(c => (
              <div key={c.id} className="p-3.5 bg-[#0d1117]/70 rounded-2xl border border-[#21262d] hover:border-[#30363d] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-white font-['Outfit']">{c.type}</div>
                    <div className="text-xs text-[#8b949e] mt-0.5">{c.student} · <span className="font-mono text-[11px]">{c.date}</span></div>
                    <div className="text-xs text-[#8b949e]/90 mt-1 line-clamp-1">{c.description}</div>
                  </div>
                  <span className={`badge flex-shrink-0 ${
                    c.status === 'resolved' ? 'badge-success' :
                    c.status === 'in_progress' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
