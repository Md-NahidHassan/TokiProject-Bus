import { useState } from 'react';
import { CheckSquare, Clock, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, SectionCard, StatCard } from '../components/ui/SharedComponents';
import { mockAttendance, mockStudents } from '../data/mockData';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function CalendarView() {
  const [year] = useState(2024);
  const [month] = useState(3); // April

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const presentDays = new Set([1,2,4,5,7,8,9,11,14,15,16,17,18,21,22,23,24,25,28,29]);
  const absentDays = new Set([3,10,13,20]);

  return (
    <div>
      <div className="text-sm font-semibold text-white mb-3">{MONTHS[month]} {year}</div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center text-[10px] text-[#484f58] font-semibold py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isPresent = presentDays.has(day);
          const isAbsent = absentDays.has(day);
          const today = day === 10;
          return (
            <div
              key={day}
              className={`h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                isPresent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                isAbsent ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-[#0d1117] text-[#484f58] border border-[#21262d]'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500/30" /><span className="text-[#8b949e]">Present</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500/30" /><span className="text-[#8b949e]">Absent</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#21262d]" /><span className="text-[#8b949e]">No Data</span></div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const [view, setView] = useState('daily'); // daily | weekly | monthly

  const presentCount = mockAttendance.filter(a => a.status === 'present').length;
  const absentCount = mockAttendance.filter(a => a.status === 'absent').length;
  const rate = Math.round((presentCount / mockAttendance.length) * 100);

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Attendance Management"
        subtitle="Track student attendance across all routes and buses"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CheckSquare} label="Present Today" value={presentCount} color="success" />
        <StatCard icon={XCircle} label="Absent Today" value={absentCount} color="danger" />
        <StatCard icon={CheckSquare} label="Attendance Rate" value={`${rate}%`} color="info" />
        <StatCard icon={Clock} label="Total Students" value={mockStudents.length} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calendar */}
        <SectionCard title="Monthly Calendar" subtitle="April 2024">
          <CalendarView />
        </SectionCard>

        {/* Today's Record */}
        <div className="lg:col-span-2">
          <SectionCard title="Recent Attendance Records">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Student</th><th>Date</th><th>Bus</th><th>Morning In</th><th>Afternoon Out</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {mockAttendance.map((a, i) => (
                    <tr key={i}>
                      <td className="font-medium text-white text-sm">{a.student}</td>
                      <td className="text-xs text-[#8b949e]">{a.date}</td>
                      <td><span className="badge badge-primary">{a.bus}</span></td>
                      <td className="text-sm text-[#c9d1d9]">
                        {a.morningIn ? (
                          <span className="flex items-center gap-1">
                            <CheckSquare size={12} className="text-emerald-400" />
                            {a.morningIn}
                          </span>
                        ) : <span className="text-red-400">—</span>}
                      </td>
                      <td className="text-sm text-[#c9d1d9]">
                        {a.afternoonOut ? (
                          <span className="flex items-center gap-1">
                            <CheckSquare size={12} className="text-emerald-400" />
                            {a.afternoonOut}
                          </span>
                        ) : <span className="text-red-400">—</span>}
                      </td>
                      <td>
                        <span className={`badge ${a.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Student Attendance Summary */}
      <SectionCard title="Student Attendance Summary" subtitle="Overall attendance rate for all students">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Department</th><th>Bus</th><th>Present</th><th>Absent</th><th>Rate</th><th>Status</th></tr>
            </thead>
            <tbody>
              {mockStudents.map(s => {
                const absent = Math.round(100 - s.attendance);
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-medium text-white text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-[#8b949e]">{s.dept}</td>
                    <td><span className="badge badge-primary">{s.bus}</span></td>
                    <td className="text-emerald-400 font-medium">{s.attendance}</td>
                    <td className="text-red-400 font-medium">{absent}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[#21262d] rounded-full">
                          <div
                            className={`h-full rounded-full ${s.attendance >= 90 ? 'bg-emerald-500' : s.attendance >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${s.attendance}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${s.attendance >= 90 ? 'text-emerald-400' : s.attendance >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                          {s.attendance}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${s.attendance >= 75 ? 'badge-success' : 'badge-danger'}`}>
                        {s.attendance >= 75 ? 'Regular' : 'Irregular'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
