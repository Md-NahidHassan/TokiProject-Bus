import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Bus, Eye } from 'lucide-react';
import { PageHeader, SectionCard, SearchBar, Modal, StatusDot } from '../components/ui/SharedComponents';
import { mockBuses } from '../data/mockData';
import { AdminAPI, USE_REAL_PHP_BACKEND } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FIELDS = [
  { key: 'busNumber', label: 'Bus Number', type: 'text', placeholder: 'NSTU-06' },
  { key: 'registration', label: 'Registration', type: 'text', placeholder: 'SYL-TA-11-0006' },
  { key: 'capacity', label: 'Capacity', type: 'number', placeholder: '45' },
  { key: 'type', label: 'Type', type: 'select', options: ['AC', 'Non-AC', 'Mini'] },
  { key: 'model', label: 'Model', type: 'text', placeholder: 'Tata LP 1613' },
  { key: 'fuel', label: 'Fuel Type', type: 'select', options: ['Diesel', 'CNG', 'Petrol'] },
  { key: 'year', label: 'Year', type: 'number', placeholder: '2022' },
  { key: 'fitness', label: 'Fitness Expiry', type: 'date', placeholder: '' },
  { key: 'insurance', label: 'Insurance Expiry', type: 'date', placeholder: '' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'maintenance'] },
];

const DEFAULT_FORM = FIELDS.reduce((a, f) => ({ ...a, [f.key]: '' }), {});

export default function BusesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'transport_admin';

  const [buses, setBuses] = useState(mockBuses);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'view'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const loadData = async () => {
    if (USE_REAL_PHP_BACKEND) {
      const res = await AdminAPI.getBuses();
      if (res && res.success) {
        setBuses(res.data.map(b => ({
          id: b.id,
          busNumber: b.bus_number,
          registration: b.registration_number,
          capacity: b.capacity,
          type: 'Non-AC',
          model: 'Unknown',
          fuel: 'Diesel',
          year: 2020,
          fitness: '2025-12-31',
          insurance: '2025-12-31',
          status: b.status || 'active',
          driver: b.driver_name || 'Unassigned',
          route: b.route_name || 'Unassigned'
        })));
      }
    }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = buses.filter(b =>
    b.busNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.registration.toLowerCase().includes(search.toLowerCase()) ||
    b.driver.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(DEFAULT_FORM); setModal('add'); };
  const openEdit = (b) => { setSelected(b); setForm({ ...b }); setModal('edit'); };
  const openView = (b) => { setSelected(b); setModal('view'); };

  const handleSave = async () => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      const payload = {
        bus_number: form.busNumber,
        registration_number: form.registration,
        capacity: form.capacity,
        status: form.status
      };
      if (modal === 'add') {
        const res = await AdminAPI.addBus(payload);
        if (res && res.success) { toast.success('Bus added!'); loadData(); }
        else toast.error(res?.message || 'Failed to add');
      } else {
        const res = await AdminAPI.updateBus(selected.id, payload);
        if (res && res.success) { toast.success('Bus updated!'); loadData(); }
        else toast.error(res?.message || 'Failed to update');
      }
    } else {
      if (modal === 'add') {
        setBuses(prev => [...prev, { ...form, id: Date.now(), driver: 'Unassigned', route: 'Unassigned', mileage: 0 }]);
        toast.success('Bus added successfully!');
      } else {
        setBuses(prev => prev.map(b => b.id === selected.id ? { ...b, ...form } : b));
        toast.success('Bus updated successfully!');
      }
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      const res = await AdminAPI.deleteBus(id);
      if (res && res.success) { toast.success('Bus removed.'); loadData(); }
      else toast.error(res?.message || 'Failed to remove');
    } else {
      setBuses(prev => prev.filter(b => b.id !== id));
      toast.success('Bus removed.');
    }
  };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Bus Management"
        subtitle={`${buses.length} buses in your fleet`}
        action={
          isAdmin ? (
            <button onClick={openAdd} className="btn btn-primary">
              <Plus size={16} /> Add Bus
            </button>
          ) : null
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: buses.length, color: 'text-white' },
          { label: 'Active', value: buses.filter(b => b.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Maintenance', value: buses.filter(b => b.status === 'maintenance').length, color: 'text-amber-400' },
          { label: 'Inactive', value: buses.filter(b => b.status === 'inactive').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[#8b949e] mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <SectionCard
        title="Fleet List"
        action={<SearchBar value={search} onChange={setSearch} placeholder="Search buses..." />}
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bus</th>
                <th>Registration</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Fitness Exp.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(bus => (
                <tr key={bus.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Bus size={14} className="text-blue-400" />
                      </div>
                      <span className="font-semibold text-white">{bus.busNumber}</span>
                    </div>
                  </td>
                  <td className="text-[#8b949e] font-mono text-xs">{bus.registration}</td>
                  <td><span className="badge badge-primary">{bus.type}</span></td>
                  <td className="text-[#c9d1d9]">{bus.capacity}</td>
                  <td className="text-[#8b949e] text-xs">{bus.driver}</td>
                  <td className="text-[#8b949e] text-xs">{bus.route}</td>
                  <td className={`text-xs ${new Date(bus.fitness) < new Date() ? 'text-red-400 font-semibold' : 'text-[#8b949e]'}`}>
                    {bus.fitness}
                  </td>
                  <td>
                    <span className={`badge ${bus.status === 'active' ? 'badge-success' : bus.status === 'maintenance' ? 'badge-warning' : 'badge-danger'}`}>
                      <StatusDot status={bus.status} />{bus.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(bus)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                        <Eye size={14} />
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(bus)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(bus.id)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[#484f58]">No buses found matching your search.</div>
          )}
        </div>
      </SectionCard>

      {/* Add/Edit Modal */}
      <Modal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add New Bus' : 'Edit Bus'}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map(f => (
            <div key={f.key} className={f.key === 'fitness' || f.key === 'insurance' ? '' : ''}>
              <label className="form-label">{f.label}</label>
              {f.type === 'select' ? (
                <select
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Select...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="form-input"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">
            {modal === 'add' ? 'Add Bus' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Bus Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#0d1117] rounded-xl border border-[#21262d]">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Bus size={26} className="text-blue-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{selected.busNumber}</div>
                <div className="text-sm text-[#8b949e]">{selected.model} · {selected.year}</div>
                <span className={`badge mt-1 ${selected.status === 'active' ? 'badge-success' : selected.status === 'maintenance' ? 'badge-warning' : 'badge-danger'}`}>
                  {selected.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Registration', value: selected.registration },
                { label: 'Type', value: selected.type },
                { label: 'Capacity', value: `${selected.capacity} seats` },
                { label: 'Fuel', value: selected.fuel },
                { label: 'Driver', value: selected.driver },
                { label: 'Route', value: selected.route },
                { label: 'Mileage', value: `${selected.mileage?.toLocaleString()} km` },
                { label: 'Last Service', value: selected.lastService },
                { label: 'Insurance', value: selected.insurance },
                { label: 'Fitness Expiry', value: selected.fitness },
              ].map(item => (
                <div key={item.label} className="p-3 bg-[#0d1117] rounded-lg border border-[#21262d]">
                  <div className="text-xs text-[#484f58] uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-sm font-medium text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
