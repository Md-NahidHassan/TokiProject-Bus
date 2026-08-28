import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, BookUser, Phone } from 'lucide-react';
import { PageHeader, SectionCard, SearchBar, Modal, StatCard } from '../components/ui/SharedComponents';
import { mockStudents } from '../data/mockData';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const [students, setStudents] = useState(mockStudents);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.dept.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ name:'', studentId:'', dept:'', semester:'', bus:'', route:'', stop:'', phone:'', status:'active' }); setModal('add'); };
  const openEdit = (s) => { setSelected(s); setForm({ ...s }); setModal('edit'); };
  const openView = (s) => { setSelected(s); setModal('view'); };

  const handleSave = () => {
    if (modal === 'add') {
      setStudents(prev => [...prev, { ...form, id: Date.now(), attendance: 0 }]);
      toast.success('Student added!');
    } else {
      setStudents(prev => prev.map(s => s.id === selected.id ? { ...s, ...form } : s));
      toast.success('Student updated!');
    }
    setModal(null);
  };

  const handleDelete = (id) => { setStudents(prev => prev.filter(s => s.id !== id)); toast.success('Student removed.'); };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Student Management"
        subtitle={`${students.length} students registered`}
        action={<button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Student</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BookUser} label="Total" value={students.length} color="primary" />
        <StatCard icon={BookUser} label="Active" value={students.filter(s => s.status === 'active').length} color="success" />
        <StatCard icon={BookUser} label="Inactive" value={students.filter(s => s.status === 'inactive').length} color="danger" />
        <StatCard icon={BookUser} label="Avg Attendance" value={`${Math.round(students.reduce((a,s) => a + s.attendance, 0) / students.length)}%`} color="info" />
      </div>

      <SectionCard title="Student List" action={<SearchBar value={search} onChange={setSearch} placeholder="Search students..." />}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Department</th><th>Semester</th><th>Bus</th><th>Stop</th><th>Attendance</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{s.name}</div>
                        <div className="text-xs text-[#8b949e]">{s.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-[#8b949e]">{s.dept}</td>
                  <td className="text-sm text-[#c9d1d9]">{s.semester}</td>
                  <td><span className="badge badge-primary">{s.bus}</span></td>
                  <td className="text-xs text-[#8b949e]">{s.stop}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#21262d] rounded-full">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className={`text-xs font-medium ${s.attendance >= 90 ? 'text-emerald-400' : s.attendance >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{s.attendance}%</span>
                    </div>
                  </td>
                  <td><span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{s.status}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(s)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Eye size={14} /></button>
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-amber-400 hover:bg-amber-500/10 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Student' : 'Edit Student'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text' },
            { key: 'studentId', label: 'Student ID', type: 'text' },
            { key: 'dept', label: 'Department', type: 'text' },
            { key: 'semester', label: 'Semester', type: 'text' },
            { key: 'phone', label: 'Phone', type: 'text' },
            { key: 'bus', label: 'Assigned Bus', type: 'text' },
            { key: 'route', label: 'Route', type: 'text' },
            { key: 'stop', label: 'Bus Stop', type: 'text' },
            { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="form-input">
                  <option value="">Select...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="form-input" />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">{modal === 'add' ? 'Add Student' : 'Save Changes'}</button>
        </div>
      </Modal>

      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Student Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white">
                {selected.name.charAt(0)}
              </div>
              <div>
                <div className="text-xl font-bold text-white">{selected.name}</div>
                <div className="text-sm text-[#8b949e]">{selected.studentId} · {selected.dept}</div>
                <span className={`badge mt-1 ${selected.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{selected.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Semester', value: selected.semester },
                { label: 'Phone', value: selected.phone },
                { label: 'Bus', value: selected.bus },
                { label: 'Route', value: selected.route },
                { label: 'Stop', value: selected.stop },
                { label: 'Attendance', value: `${selected.attendance}%` },
              ].map(i => (
                <div key={i.label} className="p-3 bg-[#0d1117] rounded-lg border border-[#21262d]">
                  <div className="text-xs text-[#484f58] uppercase">{i.label}</div>
                  <div className="text-sm font-medium text-white mt-0.5">{i.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
