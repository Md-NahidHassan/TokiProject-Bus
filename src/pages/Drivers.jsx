import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Star, UserCheck } from 'lucide-react';
import { PageHeader, SectionCard, SearchBar, Modal, StatCard } from '../components/ui/SharedComponents';
import { mockDrivers } from '../data/mockData';
import { AdminAPI, USE_REAL_PHP_BACKEND } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DriversPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'transport_admin';

  const [drivers, setDrivers] = useState(mockDrivers);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const loadData = async () => {
    if (USE_REAL_PHP_BACKEND) {
      const res = await AdminAPI.getDrivers();
      if (res && res.success) {
        setDrivers(res.data.map(d => ({
          id: d.id,
          name: d.name,
          license: d.license_number || 'N/A',
          phone: d.phone || 'N/A',
          bus: 'Unassigned',
          route: 'Unassigned',
          experience: 'N/A',
          status: d.status || 'active',
          totalTrips: 0,
          rating: 4.5,
          joinDate: d.created_at ? d.created_at.slice(0, 10) : 'N/A'
        })));
      }
    }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.license.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ name:'', license:'', phone:'', bus:'', route:'', experience:'', status:'active' }); setModal('add'); };
  const openEdit = (d) => { setSelected(d); setForm({ ...d }); setModal('edit'); };
  const openView = (d) => { setSelected(d); setModal('view'); };

  const handleSave = async () => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      const payload = {
        name: form.name,
        email: form.email || `${form.name.replace(/\s+/g, '.').toLowerCase()}@nstu.edu.bd`,
        role: 'driver',
        phone: form.phone,
        license_number: form.license,
        status: form.status
      };
      if (modal === 'add') {
        const res = await AdminAPI.addUser(payload);
        if (res && res.success) { toast.success('Driver added!'); loadData(); }
        else toast.error(res?.message || 'Failed to add');
      } else {
        const res = await AdminAPI.updateUser(selected.id, payload);
        if (res && res.success) { toast.success('Driver updated!'); loadData(); }
        else toast.error(res?.message || 'Failed to update');
      }
    } else {
      if (modal === 'add') {
        setDrivers(prev => [...prev, { ...form, id: Date.now(), totalTrips: 0, rating: 0, joinDate: new Date().toISOString().split('T')[0] }]);
        toast.success('Driver added!');
      } else {
        setDrivers(prev => prev.map(d => d.id === selected.id ? { ...d, ...form } : d));
        toast.success('Driver updated!');
      }
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      const res = await AdminAPI.deleteUser(id);
      if (res && res.success) { toast.success('Driver removed.'); loadData(); }
      else toast.error(res?.message || 'Failed to remove');
    } else {
      setDrivers(prev => prev.filter(d => d.id !== id)); toast.success('Driver removed.');
    }
  };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Driver Management"
        subtitle={`${drivers.length} drivers registered`}
        action={<button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Driver</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={UserCheck} label="Total" value={drivers.length} color="primary" />
        <StatCard icon={UserCheck} label="Active" value={drivers.filter(d => d.status === 'active').length} color="success" />
        <StatCard icon={UserCheck} label="Inactive" value={drivers.filter(d => d.status === 'inactive').length} color="danger" />
        <StatCard icon={Star} label="Avg Rating" value={`${(drivers.reduce((a,d) => a + d.rating, 0) / drivers.length).toFixed(1)}/5`} color="warning" />
      </div>

      <SectionCard title="Driver List" action={<SearchBar value={search} onChange={setSearch} placeholder="Search drivers..." />}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Driver</th><th>License</th><th>Bus</th><th>Route</th><th>Experience</th><th>Trips</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{d.name}</div>
                        <div className="text-xs text-[#8b949e]">{d.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs font-mono text-[#8b949e]">{d.license}</td>
                  <td><span className="badge badge-primary">{d.bus}</span></td>
                  <td className="text-xs text-[#8b949e] max-w-[100px] truncate">{d.route}</td>
                  <td className="text-xs text-[#c9d1d9]">{d.experience}</td>
                  <td className="text-sm font-semibold text-[#c9d1d9]">{d.totalTrips}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-[#c9d1d9]">{d.rating}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${d.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{d.status}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(d)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Eye size={14} /></button>
                      <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-amber-400 hover:bg-amber-500/10 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Driver' : 'Edit Driver'}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key:'name', label:'Full Name', type:'text' },
            { key:'license', label:'License Number', type:'text' },
            { key:'phone', label:'Phone', type:'text' },
            { key:'experience', label:'Experience', type:'text' },
            { key:'bus', label:'Assigned Bus', type:'text' },
            { key:'route', label:'Assigned Route', type:'text' },
            { key:'status', label:'Status', type:'select', options:['active','inactive'] },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key]||''} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input">
                  {f.options.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type="text" value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input"/>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">{modal==='add'?'Add Driver':'Save'}</button>
        </div>
      </Modal>

      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Driver Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                {selected.name.charAt(0)}
              </div>
              <div>
                <div className="text-xl font-bold text-white">{selected.name}</div>
                <div className="text-sm text-[#8b949e]">{selected.license}</div>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={12} className={i <= Math.floor(selected.rating) ? 'text-amber-400 fill-amber-400' : 'text-[#30363d]'} />
                  ))}
                  <span className="text-xs text-amber-400 ml-1">{selected.rating}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:'Phone', value: selected.phone },
                { label:'Experience', value: selected.experience },
                { label:'Bus', value: selected.bus },
                { label:'Route', value: selected.route },
                { label:'Total Trips', value: selected.totalTrips },
                { label:'Join Date', value: selected.joinDate },
              ].map(item => (
                <div key={item.label} className="p-3 bg-[#0d1117] rounded-lg border border-[#21262d]">
                  <div className="text-xs text-[#484f58] uppercase">{item.label}</div>
                  <div className="text-sm font-medium text-white mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
