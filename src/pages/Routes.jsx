import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Route } from 'lucide-react';
import { PageHeader, SectionCard, SearchBar, Modal, StatCard } from '../components/ui/SharedComponents';
import { mockRoutes, mockStops } from '../data/mockData';
import toast from 'react-hot-toast';

export default function RoutesPage() {
  const [routes, setRoutes] = useState(mockRoutes);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const filtered = routes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.start.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ name:'', start:'', destination:'', stops: 0, distance:'', time:'', status:'active', buses: 0, students: 0 }); setModal('add'); };
  const openEdit = (r) => { setSelected(r); setForm({ ...r }); setModal('edit'); };
  const handleSave = () => {
    if (modal === 'add') {
      setRoutes(prev => [...prev, { ...form, id: Date.now() }]);
      toast.success('Route added!');
    } else {
      setRoutes(prev => prev.map(r => r.id === selected.id ? { ...r, ...form } : r));
      toast.success('Route updated!');
    }
    setModal(null);
  };
  const handleDelete = (id) => { setRoutes(p => p.filter(r => r.id !== id)); toast.success('Route removed.'); };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Route Management"
        subtitle={`${routes.length} routes configured`}
        action={<button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Route</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Route} label="Total Routes" value={routes.length} color="primary" />
        <StatCard icon={Route} label="Active" value={routes.filter(r => r.status === 'active').length} color="success" />
        <StatCard icon={MapPin} label="Total Stops" value={mockStops.length} color="info" />
        <StatCard icon={Route} label="Total Students" value={routes.reduce((a,r) => a + r.students, 0)} color="purple" />
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {filtered.map(route => (
          <div key={route.id} className="section-card p-5 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Route size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-white">{route.name}</div>
                  <div className="text-xs text-[#8b949e]">{route.distance} · {route.time}</div>
                </div>
              </div>
              <span className={`badge ${route.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{route.status}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 p-2 bg-[#0d1117] rounded-lg border border-[#21262d] text-center">
                <div className="text-[10px] text-[#484f58] uppercase">From</div>
                <div className="text-xs font-medium text-[#c9d1d9] mt-0.5">{route.start}</div>
              </div>
              <div className="text-[#484f58]">→</div>
              <div className="flex-1 p-2 bg-[#0d1117] rounded-lg border border-[#21262d] text-center">
                <div className="text-[10px] text-[#484f58] uppercase">To</div>
                <div className="text-xs font-medium text-[#c9d1d9] mt-0.5">{route.destination}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{route.stops}</div>
                <div className="text-[10px] text-[#8b949e]">Stops</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{route.buses}</div>
                <div className="text-[10px] text-[#8b949e]">Buses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{route.students}</div>
                <div className="text-[10px] text-[#8b949e]">Students</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => openEdit(route)} className="btn btn-secondary btn-sm flex-1 justify-center"><Edit size={12} /> Edit</button>
              <button onClick={() => handleDelete(route.id)} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Bus Stops Table */}
      <SectionCard title="Bus Stops" subtitle="All configured stops across routes">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Stop Name</th><th>Route</th><th>Arrival Order</th><th>Est. Arrival</th><th>Coordinates</th></tr>
            </thead>
            <tbody>
              {mockStops.map(stop => (
                <tr key={stop.id}>
                  <td className="text-[#484f58] text-xs">{stop.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-blue-400" />
                      <span className="font-medium text-white text-sm">{stop.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{stop.route}</span></td>
                  <td className="text-[#c9d1d9]">Stop {stop.order}</td>
                  <td className="text-[#8b949e] font-medium">{stop.arrival}</td>
                  <td className="text-xs font-mono text-[#484f58]">{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Route' : 'Edit Route'}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key:'name', label:'Route Name', type:'text' },
            { key:'start', label:'Start Location', type:'text' },
            { key:'destination', label:'Destination', type:'text' },
            { key:'distance', label:'Distance', type:'text' },
            { key:'time', label:'Est. Time', type:'text' },
            { key:'status', label:'Status', type:'select', options:['active','inactive'] },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input">
                  {f.options.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type="text" value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="form-input" />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">{modal==='add'?'Add Route':'Save'}</button>
        </div>
      </Modal>
    </div>
  );
}
