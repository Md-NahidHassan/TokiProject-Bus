import { FileText, Download, Filter, Bus, Users, UserCheck, ClipboardList } from 'lucide-react';
import { PageHeader, SectionCard, StatCard } from '../components/ui/SharedComponents';
import { mockStudents, mockBuses, mockDrivers } from '../data/mockData';
import toast from 'react-hot-toast';

const REPORTS = [
  { key: 'student', label: 'Student Report', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20', desc: 'Complete list of all registered students with bus and route info' },
  { key: 'driver', label: 'Driver Report', icon: UserCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/20', desc: 'Driver details, trip history, and performance ratings' },
  { key: 'bus', label: 'Bus Report', icon: Bus, color: 'text-purple-400', bg: 'bg-purple-500/20', desc: 'Fleet status, maintenance history, and fitness details' },
  { key: 'attendance', label: 'Attendance Report', icon: ClipboardList, color: 'text-emerald-400', bg: 'bg-emerald-500/20', desc: 'Daily, weekly, and monthly attendance summaries' },
  { key: 'complaint', label: 'Complaint Report', icon: FileText, color: 'text-red-400', bg: 'bg-red-500/20', desc: 'All complaints with status and resolution details' },
  { key: 'maintenance', label: 'Maintenance Report', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/20', desc: 'Service records, costs, and upcoming maintenance' },
];

export default function ReportsPage() {
  const handleDownload = (report, format) => {
    toast.success(`${report} downloaded as ${format}!`);
  };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Reports"
        subtitle="Generate and export data reports in various formats"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Students" value={mockStudents.length} color="primary" />
        <StatCard icon={Bus} label="Buses" value={mockBuses.length} color="info" />
        <StatCard icon={UserCheck} label="Drivers" value={mockDrivers.length} color="success" />
        <StatCard icon={FileText} label="Reports Available" value={REPORTS.length} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {REPORTS.map(r => (
          <div key={r.key} className="section-card p-5 card-hover">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${r.bg} flex items-center justify-center flex-shrink-0`}>
                <r.icon size={22} className={r.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white mb-1">{r.label}</div>
                <div className="text-xs text-[#8b949e] mb-3">{r.desc}</div>
                <div className="flex gap-2 flex-wrap">
                  {['PDF', 'Excel', 'CSV'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleDownload(r.label, fmt)}
                      className={`btn btn-sm ${fmt === 'PDF' ? 'btn-danger' : fmt === 'Excel' ? 'btn-success' : 'btn-secondary'}`}
                    >
                      <Download size={12} /> {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Table */}
      <SectionCard title="Live Student Data Preview">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Student ID</th><th>Name</th><th>Dept</th><th>Bus</th><th>Route</th><th>Stop</th><th>Attendance</th></tr>
            </thead>
            <tbody>
              {mockStudents.map(s => (
                <tr key={s.id}>
                  <td className="font-mono text-xs text-[#8b949e]">{s.studentId}</td>
                  <td className="font-medium text-white">{s.name}</td>
                  <td className="text-[#8b949e]">{s.dept}</td>
                  <td><span className="badge badge-primary">{s.bus}</span></td>
                  <td className="text-xs text-[#8b949e]">{s.route}</td>
                  <td className="text-xs text-[#8b949e]">{s.stop}</td>
                  <td>
                    <span className={`font-bold ${s.attendance >= 90 ? 'text-emerald-400' : s.attendance >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                      {s.attendance}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4 justify-end">
          {['PDF', 'Excel', 'CSV'].map(fmt => (
            <button key={fmt} onClick={() => handleDownload('Student Report', fmt)} className="btn btn-secondary btn-sm">
              <Download size={12} /> {fmt}
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
