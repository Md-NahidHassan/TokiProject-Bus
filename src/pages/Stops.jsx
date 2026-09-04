import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Search } from 'lucide-react';
import { PageHeader, SectionCard, SearchBar, Modal, StatCard } from '../components/ui/SharedComponents';
import { mockStops } from '../data/mockData';
import { AdminAPI, USE_REAL_PHP_BACKEND } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function StopsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'transport_admin';

  const [stops, setStops] = useState(mockStops);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const loadData = async () => {
    if (USE_REAL_PHP_BACKEND) {
      const res = await AdminAPI.getStops();
      if (res && res.success) {
        setStops(res.data);
      }
    }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = stops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.route.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ name:'', route:'', lat:'', lng:'', order:'', arrival:'' }); setModal('add'); };
  const openEdit = (s) => { setSelected(s); setForm({ ...s }); setModal('edit'); };
  
  const handleSave = async () => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      const payload = {
        stop_name: form.name,
        route: form.route,
        order: Number(form.order || 1),
        latitude: Number(form.lat || 0),
        longitude: Number(form.lng || 0),
        arrival_time: form.arrival || null
      };
      if (modal === 'add') {
        const res = await AdminAPI.addStop(payload);
        if (res && res.success) { toast.success('Bus stop added!'); loadData(); }
        else toast.error(res?.message || 'Failed to add');
      } else {
        const res = await AdminAPI.updateStop(selected.id, payload);
        if (res && res.success) { toast.success('Bus stop updated!'); loadData(); }
        else toast.error(res?.message || 'Failed to update');
      }
    } else {
      if (modal === 'add') {
        setStops(p => [...p, { ...form, id: Date.now(), lat: Number(form.lat||0), lng: Number(form.lng||0), order: Number(form.order||0) }]);
        toast.success('Bus stop added!');
      } else {
        setStops(p => p.map(s => s.id === selected.id ? { ...s, ...form, lat: Number(form.lat||0), lng: Number(form.lng||0), order: Number(form.order||0) } : s));
        toast.success('Bus stop updated!');
      }
    }
    setModal(null);
  };
  
  const handleDelete = async (id) => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      const res = await AdminAPI.deleteStop(id);
      if (res && res.success) { toast.success('Bus stop removed.'); loadData(); }
      else toast.error(res?.message || 'Failed to delete');
    } else {
      setStops(p => p.filter(s => s.id !== id)); toast.success('Bus stop removed.');
    }
  };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Bus Stop Management"
        subtitle={`${stops.length} physical stops configured across all routes`}
        action={isAdmin ? <button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Stop</button> : null}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={MapPin} label="Total Stops" value={stops.length} color="primary" />
        <StatCard icon={MapPin} label="Route A" value={stops.filter(s=>s.route.includes('Route A')).length} color="success" />
        <StatCard icon={MapPin} label="Route B" value={stops.filter(s=>s.route.includes('Route B')).length} color="info" />
        <StatCard icon={MapPin} label="Other Routes" value={stops.filter(s=>!s.route.includes('Route A') && !s.route.includes('Route B')).length} color="purple" />
      </div>

      <SectionCard title="Stops Directory" action={<SearchBar value={search} onChange={setSearch} placeholder="Search stops..." />}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Stop Name</th><th>Assigned Route</th><th>Order</th><th>Est. Arrival</th><th>Coordinates (Lat, Lng)</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <MapPin size={14} className="text-emerald-400" />
                      </div>
                      <span className="font-medium text-white">{s.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{s.route}</span></td>
                  <td>
                    <span className="text-sm font-semibold text-[#c9d1d9]">{s.order}</span>
                  </td>
                  <td className="text-sm text-[#8b949e]">{s.arrival}</td>
                  <td className="text-xs font-mono text-[#484f58]">
                    {Number(s.lat).toFixed(4)}, {Number(s.lng).toFixed(4)}
                  </td>
                  <td>
                    {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-amber-400 hover:bg-amber-500/10 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                    </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Bus Stop' : 'Edit Bus Stop'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Stop Name</label>
            <input type="text" value={form.name||''} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="form-input" placeholder="e.g. Ambarkhana" />
          </div>
          <div className="col-span-2">
            <label className="form-label">Assigned Route</label>
            <input type="text" value={form.route||''} onChange={e=>setForm(p=>({...p,route:e.target.value}))} className="form-input" placeholder="e.g. Route A" />
          </div>
          <div>
            <label className="form-label">Arrival Order</label>
            <input type="number" value={form.order||''} onChange={e=>setForm(p=>({...p,order:e.target.value}))} className="form-input" placeholder="e.g. 1" />
          </div>
          <div>
            <label className="form-label">Estimated Arrival Time</label>
            <input type="text" value={form.arrival||''} onChange={e=>setForm(p=>({...p,arrival:e.target.value}))} className="form-input" placeholder="08:00 AM" />
          </div>
          <div>
            <label className="form-label">Latitude</label>
            <input type="number" step="0.0001" value={form.lat||''} onChange={e=>setForm(p=>({...p,lat:e.target.value}))} className="form-input" placeholder="24.9034" />
          </div>
          <div>
            <label className="form-label">Longitude</label>
            <input type="number" step="0.0001" value={form.lng||''} onChange={e=>setForm(p=>({...p,lng:e.target.value}))} className="form-input" placeholder="91.8697" />
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">{modal==='add'?'Add Stop':'Save Changes'}</button>
        </div>
      </Modal>
    </div>
  );
}
