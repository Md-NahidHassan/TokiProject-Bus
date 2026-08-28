import { useState } from 'react';
import { Plus, Edit, Trash2, Wrench, Calendar, DollarSign } from 'lucide-react';
import { PageHeader, SectionCard, Modal, StatCard, StatusDot } from '../components/ui/SharedComponents';
import { mockMaintenance } from '../data/mockData';
import toast from 'react-hot-toast';

export default function MaintenancePage() {
  const [records, setRecords] = useState(mockMaintenance);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [filter, setFilter] = useState('all');

  const filtered = records.filter(r => filter === 'all' || r.status === filter);

  const totalCost = records.reduce((a, r) => a + r.cost, 0);

  const openAdd = () => {
    setForm({ bus:'', type:'', date:'', nextDate:'', cost:'', mechanic:'', status:'scheduled', notes:'' });
    setModal('add');
  };
  const openEdit = (r) => { setSelected(r); setForm({ ...r }); setModal('edit'); };
  const handleSave = () => {
    if (modal === 'add') {
      setRecords(p => [...p, { ...form, id: Date.now(), cost: Number(form.cost) }]);
      toast.success('Maintenance record added!');
    } else {
      setRecords(p => p.map(r => r.id === selected.id ? { ...r, ...form, cost: Number(form.cost) } : r));
      toast.success('Record updated!');
    }
    setModal(null);
  };
  const handleDelete = (id) => { setRecords(p => p.filter(r => r.id !== id)); toast.success('Record removed.'); };

  const statusColors = { completed: 'badge-success', in_progress: 'badge-info', scheduled: 'badge-primary' };
  const typeColors = { 'Oil Change': 'text-amber-400 bg-amber-500/20', 'Tire Replacement': 'text-blue-400 bg-blue-500/20', 'Engine Overhaul': 'text-red-400 bg-red-500/20', 'Brake Service': 'text-orange-400 bg-orange-500/20' };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Maintenance Management"
        subtitle="Track all bus maintenance and service records"
        action={<button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Record</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wrench} label="Total Records" value={records.length} color="primary" />
        <StatCard icon={Wrench} label="Scheduled" value={records.filter(r => r.status === 'scheduled').length} color="info" />
        <StatCard icon={Wrench} label="In Progress" value={records.filter(r => r.status === 'in_progress').length} color="warning" />
        <StatCard icon={DollarSign} label="Total Cost" value={`৳${totalCost.toLocaleString()}`} color="danger" />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all','scheduled','in_progress','completed'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === s ? 'gradient-primary text-white' : 'bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-white'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(r => (
          <div key={r.id} className="section-card p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[r.type] || 'text-[#8b949e] bg-[#21262d]'}`}>
                  <Wrench size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">{r.type}</div>
                  <div className="text-xs text-[#8b949e]">Bus: <span className="text-blue-400 font-semibold">{r.bus}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${statusColors[r.status] || 'badge-primary'}`}>
                  <StatusDot status={r.status} />{r.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#21262d]">
                <div className="text-[10px] text-[#484f58] uppercase">Service Date</div>
                <div className="text-sm font-medium text-white mt-0.5">{r.date}</div>
              </div>
              <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#21262d]">
                <div className="text-[10px] text-[#484f58] uppercase">Next Service</div>
                <div className="text-sm font-medium text-white mt-0.5">{r.nextDate}</div>
              </div>
              <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#21262d]">
                <div className="text-[10px] text-[#484f58] uppercase">Cost</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">৳{r.cost.toLocaleString()}</div>
              </div>
              <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#21262d]">
                <div className="text-[10px] text-[#484f58] uppercase">Mechanic</div>
                <div className="text-xs font-medium text-[#c9d1d9] mt-0.5 truncate">{r.mechanic}</div>
              </div>
            </div>

            {r.notes && (
              <div className="text-xs text-[#8b949e] p-2 bg-[#0d1117] rounded-lg border border-[#21262d] mb-3">
                {r.notes}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => openEdit(r)} className="btn btn-secondary btn-sm flex-1 justify-center"><Edit size={12} /> Edit</button>
              <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Maintenance Record' : 'Edit Record'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          {[
            { key:'bus', label:'Bus Number', type:'text' },
            { key:'type', label:'Service Type', type:'select', options:['Oil Change','Tire Replacement','Engine Overhaul','Brake Service','Body Repair','AC Service','Other'] },
            { key:'date', label:'Service Date', type:'date' },
            { key:'nextDate', label:'Next Service Date', type:'date' },
            { key:'cost', label:'Cost (৳)', type:'number' },
            { key:'mechanic', label:'Mechanic/Workshop', type:'text' },
            { key:'status', label:'Status', type:'select', options:['scheduled','in_progress','completed'] },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input">
                  <option value="">Select...</option>
                  {f.options.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input"/>
              )}
            </div>
          ))}
          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea value={form.notes||''} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={3} className="form-input resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">{modal==='add'?'Add Record':'Save'}</button>
        </div>
      </Modal>
    </div>
  );
}
