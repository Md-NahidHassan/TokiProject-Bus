import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Sun, Sunset, Moon } from 'lucide-react';
import { PageHeader, SectionCard, Modal, StatCard } from '../components/ui/SharedComponents';
import { mockSchedules } from '../data/mockData';
import { AdminAPI, StudentAPI, USE_REAL_PHP_BACKEND } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const typeConfig = {
  morning: { icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Morning' },
  afternoon: { icon: Sunset, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30', label: 'Afternoon' },
  evening: { icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30', label: 'Evening' },
};

export default function SchedulesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'transport_admin';

  const [schedules, setSchedules] = useState(mockSchedules);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const filtered = schedules.filter(s => filter === 'all' || s.type === filter);

  const loadData = async () => {
    if (USE_REAL_PHP_BACKEND) {
      const res = isAdmin ? await AdminAPI.getSchedules() : await StudentAPI.getSchedules();
      if (res && res.success) {
        // Map backend student schedules structure to UI expected structure if it's from student endpoint
        const data = isAdmin ? res.data : res.data.map(s => ({
          id: s.id,
          bus: s.bus || 'Unknown',
          driver: s.driver || 'Unknown',
          route: s.route || 'Unknown',
          departure: s.departure_time ? s.departure_time.slice(0,5) + ' AM' : '08:00 AM', // Simple fallback mapping
          arrival: s.arrival_time ? s.arrival_time.slice(0,5) + ' AM' : '-',
          type: s.shift || 'morning',
          days: s.day_type === 'weekend' ? ['Fri', 'Sat'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
          status: s.schedule_status || s.status
        }));
        setSchedules(data);
      }
    }
  };
  useEffect(() => { loadData(); }, [isAdmin]);

  const openAdd = () => {
    setForm({ bus:'', driver:'', route:'', departure:'', arrival:'', type:'morning', days:['Mon','Tue','Wed','Thu','Fri'], status:'active' });
    setModal('add');
  };
  const openEdit = (s) => { setSelected(s); setForm({ ...s, days: [...s.days] }); setModal('edit'); };

  const handleSave = async () => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      if (modal === 'add') {
        const res = await AdminAPI.addSchedule(form);
        if (res && res.success) { toast.success('Schedule added!'); loadData(); }
        else { toast.error(res?.message || 'Failed to add'); }
      } else {
        const res = await AdminAPI.updateSchedule(selected.id, form);
        if (res && res.success) { toast.success('Schedule updated!'); loadData(); }
        else { toast.error(res?.message || 'Failed to update'); }
      }
    } else {
      if (modal === 'add') {
        setSchedules(p => [...p, { ...form, id: Date.now() }]);
        toast.success('Schedule added!');
      } else {
        setSchedules(p => p.map(s => s.id === selected.id ? { ...s, ...form } : s));
        toast.success('Schedule updated!');
      }
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      const res = await AdminAPI.deleteSchedule(id);
      if (res && res.success) { toast.success('Schedule removed.'); loadData(); }
      else { toast.error(res?.message || 'Failed to remove'); }
    } else {
      setSchedules(p => p.filter(s => s.id !== id)); toast.success('Schedule removed.');
    }
  };

  const toggleDay = (day) => {
    setForm(p => ({
      ...p,
      days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day]
    }));
  };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Schedule Management"
        subtitle={`${schedules.length} schedules configured`}
        action={isAdmin ? <button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Schedule</button> : null}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={Sun} label="Morning" value={schedules.filter(s=>s.type==='morning').length} color="warning" />
        <StatCard icon={Sunset} label="Afternoon" value={schedules.filter(s=>s.type==='afternoon').length} color="danger" />
        <StatCard icon={Moon} label="Evening" value={schedules.filter(s=>s.type==='evening').length} color="purple" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['all','morning','afternoon','evening'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === t
                ? 'gradient-primary text-white'
                : 'bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(s => {
          const tc = typeConfig[s.type] || typeConfig.morning;
          return (
            <div key={s.id} className={`p-5 rounded-xl border ${tc.bg} card-hover`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${tc.bg} flex items-center justify-center`}>
                    <tc.icon size={18} className={tc.color} />
                  </div>
                  <div>
                    <div className="font-bold text-white">{s.bus}</div>
                    <div className="text-xs text-[#8b949e]">{s.driver}</div>
                  </div>
                </div>
                {isAdmin && (
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-amber-400 hover:bg-amber-500/10 transition-colors"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                </div>
                )}
              </div>

              <div className="text-xs text-[#8b949e] mb-3">{s.route}</div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className={tc.color} />
                  <span className="text-sm font-bold text-white">{s.departure}</span>
                  <span className="text-[#484f58]">→</span>
                  <span className="text-sm font-semibold text-[#c9d1d9]">{s.arrival}</span>
                </div>
                <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'} ml-auto`}>{s.status}</span>
              </div>

              <div className="flex gap-1">
                {DAYS.map(d => (
                  <span key={d} className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    s.days.includes(d)
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-[#0d1117] text-[#484f58] border border-[#21262d]'
                  }`}>{d}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Schedule' : 'Edit Schedule'}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key:'bus', label:'Bus Number', type:'text' },
            { key:'driver', label:'Driver', type:'text' },
            { key:'route', label:'Route', type:'text' },
            { key:'type', label:'Trip Type', type:'select', options:['morning','afternoon','evening'] },
            { key:'departure', label:'Departure Time', type:'text', placeholder:'08:00 AM' },
            { key:'arrival', label:'Arrival Time', type:'text', placeholder:'08:35 AM' },
            { key:'status', label:'Status', type:'select', options:['active','inactive'] },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input">
                  {f.options.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type="text" value={form[f.key]||''} placeholder={f.placeholder} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input"/>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="form-label">Operating Days</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  form.days?.includes(d)
                    ? 'gradient-primary text-white'
                    : 'bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">{modal==='add'?'Add Schedule':'Save'}</button>
        </div>
      </Modal>
    </div>
  );
}
