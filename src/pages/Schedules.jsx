import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Sun, Sunset, Moon, Bus, MapPin, User, CheckCircle2 } from 'lucide-react';
import { PageHeader, SectionCard, Modal, StatCard } from '../components/ui/SharedComponents';
import { mockSchedules, mockBuses, mockRoutes, mockDrivers } from '../data/mockData';
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
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const filtered = schedules.filter(s => filter === 'all' || s.type === filter);

  const loadData = async () => {
    if (USE_REAL_PHP_BACKEND) {
      try {
        const res = isAdmin ? await AdminAPI.getSchedules() : await StudentAPI.getSchedules();
        if (res && res.success) {
          const data = isAdmin ? res.data : res.data.map(s => ({
            id: s.id,
            bus_id: s.bus_id,
            route_id: s.route_id,
            driver_id: s.driver_id,
            bus: s.bus || 'Unknown Bus',
            driver: s.driver || 'Unassigned Driver',
            route: s.route || 'Unknown Route',
            departure: s.departure_time ? s.departure_time.slice(0, 5) + ' AM' : '08:00 AM',
            arrival: s.arrival_time ? s.arrival_time.slice(0, 5) + ' AM' : '-',
            type: s.shift || 'morning',
            days: s.day_type === 'weekend' ? ['Fri', 'Sat'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
            status: s.schedule_status === 'scheduled' || s.schedule_status === 'active' ? 'active' : (s.schedule_status || 'active')
          }));
          setSchedules(data);
        }

        if (isAdmin) {
          const [busRes, routeRes, driverRes] = await Promise.all([
            AdminAPI.getBuses(),
            AdminAPI.getRoutes(),
            AdminAPI.getDrivers()
          ]);
          if (busRes?.success) setBuses(busRes.data || []);
          if (routeRes?.success) setRoutes(routeRes.data || []);
          if (driverRes?.success) setDrivers(driverRes.data || []);
        }
      } catch (err) {
        console.warn('Error fetching schedules data', err);
      }
    } else {
      setBuses(mockBuses);
      setRoutes(mockRoutes);
      setDrivers(mockDrivers);
    }
  };

  useEffect(() => { loadData(); }, [isAdmin]);

  const openAdd = () => {
    const defaultBus = buses[0] || { id: 1, bus_number: 'NSTU-01' };
    const defaultRoute = routes[0] || { id: 1, route_name: 'Route A - Sonapur Express' };
    const defaultDriver = drivers[0] || { id: 3, name: 'Md. Karim Uddin' };

    setForm({
      bus_id: defaultBus.id,
      bus: defaultBus.bus_number || defaultBus.busNumber || 'NSTU-01',
      route_id: defaultRoute.id,
      route: defaultRoute.route_name || defaultRoute.name || 'Route A',
      driver_id: defaultDriver.id,
      driver: defaultDriver.name || 'Md. Karim Uddin',
      departure: '08:00 AM',
      arrival: '08:35 AM',
      type: 'morning',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
      status: 'active'
    });
    setModal('add');
  };

  const openEdit = (s) => {
    setSelected(s);
    setForm({
      ...s,
      bus_id: s.bus_id || buses.find(b => b.bus_number === s.bus || b.busNumber === s.bus)?.id || buses[0]?.id || '',
      route_id: s.route_id || routes.find(r => (r.route_name || r.name) === s.route)?.id || routes[0]?.id || '',
      driver_id: s.driver_id || drivers.find(d => d.name === s.driver)?.id || drivers[0]?.id || '',
      days: [...(s.days || [])]
    });
    setModal('edit');
  };

  const handleBusChange = (e) => {
    const selectedBusId = Number(e.target.value);
    const busObj = buses.find(b => b.id === selectedBusId);
    setForm(prev => ({
      ...prev,
      bus_id: selectedBusId,
      bus: busObj?.bus_number || busObj?.busNumber || prev.bus
    }));
  };

  const handleRouteChange = (e) => {
    const selectedRouteId = Number(e.target.value);
    const routeObj = routes.find(r => r.id === selectedRouteId);
    setForm(prev => ({
      ...prev,
      route_id: selectedRouteId,
      route: routeObj?.route_name || routeObj?.name || prev.route
    }));
  };

  const handleDriverChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setForm(prev => ({ ...prev, driver_id: null, driver: 'Unassigned Driver' }));
    } else {
      const selectedDriverId = Number(val);
      const driverObj = drivers.find(d => d.id === selectedDriverId);
      setForm(prev => ({
        ...prev,
        driver_id: selectedDriverId,
        driver: driverObj?.name || prev.driver
      }));
    }
  };

  const handleSave = async () => {
    if (USE_REAL_PHP_BACKEND && isAdmin) {
      if (modal === 'add') {
        const res = await AdminAPI.addSchedule(form);
        if (res && res.success) {
          toast.success('Schedule added successfully! 🚍');
          loadData();
        } else {
          toast.error(res?.message || 'Failed to add schedule');
        }
      } else {
        const res = await AdminAPI.updateSchedule(selected.id, form);
        if (res && res.success) {
          toast.success('Schedule updated successfully! ✨');
          loadData();
        } else {
          toast.error(res?.message || 'Failed to update schedule');
        }
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
      if (res && res.success) {
        toast.success('Schedule removed.');
        loadData();
      } else {
        toast.error(res?.message || 'Failed to remove');
      }
    } else {
      setSchedules(p => p.filter(s => s.id !== id));
      toast.success('Schedule removed.');
    }
  };

  const toggleDay = (day) => {
    setForm(p => ({
      ...p,
      days: (p.days || []).includes(day)
        ? (p.days || []).filter(d => d !== day)
        : [...(p.days || []), day]
    }));
  };

  return (
    <div className="page-container p-4 lg:p-6 space-y-6 fade-in">
      <PageHeader
        title="Schedule Management"
        subtitle={`${schedules.length} bus timetables & driver assignments configured`}
        action={isAdmin ? (
          <button onClick={openAdd} className="btn btn-primary shadow-lg flex items-center gap-2">
            <Plus size={16} /> Add Schedule
          </button>
        ) : null}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Sun} label="Morning Shifts" value={schedules.filter(s => s.type === 'morning').length} color="warning" />
        <StatCard icon={Sunset} label="Afternoon Shifts" value={schedules.filter(s => s.type === 'afternoon').length} color="danger" />
        <StatCard icon={Moon} label="Evening Shifts" value={schedules.filter(s => s.type === 'evening').length} color="purple" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'morning', 'afternoon', 'evening'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider capitalize transition-all ${
              filter === t
                ? 'gradient-primary text-white shadow-lg'
                : 'bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-white hover:border-[#30363d]'
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
            <div key={s.id} className={`p-5 rounded-2xl border ${tc.bg} card-hover relative overflow-hidden group shadow-lg`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${tc.bg} flex items-center justify-center border shadow-inner`}>
                    <tc.icon size={22} className={tc.color} />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-base font-['Outfit'] flex items-center gap-2">
                      <Bus size={15} className="text-amber-400" />
                      {s.bus}
                    </div>
                    <div className="text-xs text-[#8b949e] flex items-center gap-1.5 mt-0.5">
                      <User size={13} className="text-blue-400" />
                      <span className="font-medium text-[#c9d1d9]">{s.driver}</span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s)} className="p-2 rounded-xl text-[#8b949e] hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Edit Schedule">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-xl text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete Schedule">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Route */}
              <div className="text-xs font-semibold text-[#8b949e] flex items-center gap-1.5 mb-3 bg-[#0d1117]/60 p-2.5 rounded-xl border border-white/5">
                <MapPin size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate text-white">{s.route}</span>
              </div>

              {/* Time & Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={14} className={tc.color} />
                  <span className="text-sm font-black text-white font-mono">{s.departure}</span>
                  <span className="text-[#484f58]">→</span>
                  <span className="text-sm font-bold text-[#c9d1d9] font-mono">{s.arrival}</span>
                </div>
                <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {s.status}
                </span>
              </div>

              {/* Days */}
              <div className="flex gap-1 flex-wrap">
                {DAYS.map(d => (
                  <span key={d} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    (s.days || []).includes(d)
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-[#0d1117] text-[#484f58] border border-[#21262d]'
                  }`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Bus Schedule' : 'Edit Schedule'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bus Dropdown */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Bus size={13} className="text-amber-400" />
              Select Bus
            </label>
            <select
              value={form.bus_id || ''}
              onChange={handleBusChange}
              className="form-input"
              required
            >
              {buses.length > 0 ? (
                buses.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bus_number || b.busNumber} ({b.capacity || 52} seats)
                  </option>
                ))
              ) : (
                <option value="1">NSTU-01 (Standard)</option>
              )}
            </select>
          </div>

          {/* Route Dropdown */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <MapPin size={13} className="text-emerald-400" />
              Select Route
            </label>
            <select
              value={form.route_id || ''}
              onChange={handleRouteChange}
              className="form-input"
              required
            >
              {routes.length > 0 ? (
                routes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.route_name || r.name} ({r.distance_km || '12'} km)
                  </option>
                ))
              ) : (
                <option value="1">Route A - Sonapur Express</option>
              )}
            </select>
          </div>

          {/* Driver Dropdown */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <User size={13} className="text-blue-400" />
              Assign Driver
            </label>
            <select
              value={form.driver_id || ''}
              onChange={handleDriverChange}
              className="form-input"
            >
              <option value="">Unassigned Driver</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.phone ? `(${d.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Shift */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Sun size={13} className="text-amber-400" />
              Trip Shift
            </label>
            <select
              value={form.type || 'morning'}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="form-input"
            >
              <option value="morning">Morning Shift (07:00 - 11:00 AM)</option>
              <option value="afternoon">Afternoon Shift (12:00 - 04:00 PM)</option>
              <option value="evening">Evening Shift (05:00 - 09:00 PM)</option>
            </select>
          </div>

          {/* Departure Time */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Clock size={13} className="text-cyan-400" />
              Departure Time
            </label>
            <input
              type="text"
              value={form.departure || ''}
              placeholder="e.g. 08:00 AM"
              onChange={e => setForm(p => ({ ...p, departure: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          {/* Arrival Time */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Clock size={13} className="text-cyan-400" />
              Arrival Time
            </label>
            <input
              type="text"
              value={form.arrival || ''}
              placeholder="e.g. 08:35 AM"
              onChange={e => setForm(p => ({ ...p, arrival: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <label className="form-label flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Schedule Status
            </label>
            <select
              value={form.status || 'active'}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="form-input"
            >
              <option value="active">Active / Running</option>
              <option value="inactive">Inactive / Suspended</option>
            </select>
          </div>
        </div>

        {/* Operating Days */}
        <div className="mt-4">
          <label className="form-label">Operating Days of the Week</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {DAYS.map(d => {
              const active = (form.days || []).includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'gradient-primary text-white shadow-md'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d]'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(null)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary font-bold shadow-lg">
            {modal === 'add' ? 'Save Schedule' : 'Update Schedule'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
