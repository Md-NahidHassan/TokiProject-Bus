import { Bus, Users, Route, Calendar, AlertCircle, Wrench, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { StatCard, SectionCard, PageHeader, StatusDot } from '../../components/ui/SharedComponents';
import { mockBuses, mockDrivers, mockRoutes, mockSchedules, mockComplaints, analyticsData } from '../../data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(13,17,23,0.95)',
      borderColor: '#30363d', borderWidth: 1,
      titleColor: '#ffffff', bodyColor: '#c9d1d9', padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: { grid: { color: 'rgba(33,38,45,0.7)' }, ticks: { color: '#8b949e', font: { size: 11 } } },
    y: { grid: { color: 'rgba(33,38,45,0.7)' }, ticks: { color: '#8b949e', font: { size: 11 } } },
  },
};

export default function TransportAdminDashboard() {
  const activeBuses = mockBuses.filter(b => b.status === 'active').length;

  const tripsData = {
    labels: analyticsData.weekly.labels,
    datasets: [{
      data: analyticsData.weekly.trips,
      backgroundColor: 'rgba(139,92,246,0.75)',
      borderColor: '#8b5cf6',
      borderWidth: 1,
      borderRadius: 8,
    }],
  };

  return (
    <div className="page-container p-4 lg:p-6 fade-in space-y-6">
      <PageHeader
        title="Transport Fleet Control"
        subtitle="Manage fleet allocation, driver schedules, and route operations"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bus} label="Active Fleet Buses" value={activeBuses} change="+0" color="primary" />
        <StatCard icon={Users} label="On-Duty Drivers" value={mockDrivers.filter(d => d.status === 'active').length} color="success" />
        <StatCard icon={Route} label="Active Bus Routes" value={mockRoutes.filter(r => r.status === 'active').length} color="info" />
        <StatCard icon={AlertCircle} label="Open Issues" value={mockComplaints.filter(c => c.status !== 'resolved').length} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Weekly Fleet Trip Count" subtitle="Completed trips this week across all active buses">
          <div style={{ height: 230 }}>
            <Bar data={tripsData} options={chartOptions} />
          </div>
        </SectionCard>

        <SectionCard title="Active Today's Schedules" action={<a href="/schedules" className="text-xs text-blue-400 font-semibold">View all →</a>}>
          <div className="space-y-2.5">
            {mockSchedules.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3.5 bg-[#0d1117]/80 rounded-2xl border border-[#21262d]">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    s.type === 'morning' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                  }`}>
                    <Clock size={16} className={s.type === 'morning' ? 'text-amber-400' : 'text-blue-400'} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white font-['Outfit']">{s.bus} · {s.route.slice(0,20)}</div>
                    <div className="text-xs text-[#8b949e]">Driver: {s.driver}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white font-mono">{s.departure}</div>
                  <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'} text-[10px]`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bus Status */}
        <SectionCard title="Fleet Vehicle Health" action={<a href="/buses" className="text-xs text-blue-400 font-semibold">Manage Fleet →</a>}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Bus Code</th><th>Type</th><th>Fitness Cert</th><th>Status</th></tr>
              </thead>
              <tbody>
                {mockBuses.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="font-bold text-white font-['Outfit']">{b.busNumber}</div>
                      <div className="text-xs text-[#8b949e]">{b.driver}</div>
                    </td>
                    <td><span className="badge badge-primary text-[10px]">{b.type}</span></td>
                    <td className="text-xs text-[#8b949e] font-mono">{b.fitness}</td>
                    <td>
                      <span className={`badge ${b.status === 'active' ? 'badge-success' : b.status === 'maintenance' ? 'badge-warning' : 'badge-danger'}`}>
                        <StatusDot status={b.status} /> {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Complaints */}
        <SectionCard title="Pending Passenger Complaints" action={<a href="/complaints" className="text-xs text-blue-400 font-semibold">View all →</a>}>
          <div className="space-y-3">
            {mockComplaints.filter(c => c.status !== 'resolved').map(c => (
              <div key={c.id} className="p-3.5 bg-[#0d1117]/80 rounded-2xl border border-[#21262d]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-bold text-white font-['Outfit']">{c.type}</div>
                    <div className="text-xs text-[#8b949e]">{c.student} · <span className="font-mono text-[10px]">{c.date}</span></div>
                    <div className="text-xs text-[#8b949e]/90 mt-1 line-clamp-1">{c.description}</div>
                  </div>
                  <span className={`badge ${c.priority === 'high' ? 'badge-danger' : c.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                    {c.priority} priority
                  </span>
                </div>
                <div className="mt-3">
                  <button className="btn btn-sm btn-primary">Take Action</button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
