import { useState, useEffect } from 'react';
import { 
  Bus, MapPin, Clock, Users, PlayCircle, StopCircle, Navigation, 
  Radio, RotateCw, Compass, ArrowRight 
} from 'lucide-react';
import { PageHeader, SectionCard, StatCard } from '../../components/ui/SharedComponents';
import { useAuth } from '../../context/AuthContext';
import { mockStudents, mockSchedules, mockRoutes } from '../../data/mockData';
import { DriverAPI, USE_REAL_PHP_BACKEND } from '../../services/api';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const { user } = useAuth();
  const driverId = user?.id || 3;

  const [tripActive, setTripActive] = useState(false);
  const [assignedBus, setAssignedBus] = useState(null);
  const [allRoutes, setAllRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [currentRoute, setCurrentRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [passengersCount, setPassengersCount] = useState(0);
  const [changingRoute, setChangingRoute] = useState(false);

  // Load real driver data from backend
  const loadDriverData = async () => {
    if (USE_REAL_PHP_BACKEND) {
      try {
        const res = await DriverAPI.getDashboard(driverId);
        if (res && res.success) {
          const bus = res.assigned_bus;
          setAssignedBus(bus);
          setSchedules(res.schedules || []);
          setPassengersCount(res.today_passengers_scanned || 0);

          const routesList = res.all_routes || [];
          setAllRoutes(routesList);

          if (bus?.route_id) {
            setSelectedRouteId(String(bus.route_id));
            const matched = routesList.find(r => r.id === bus.route_id);
            setCurrentRoute(matched || {
              id: bus.route_id,
              route_name: bus.route_name || 'Route A',
              start_location: bus.start_location || 'NSTU Campus',
              end_location: bus.end_location || 'Maijdee',
              distance_km: bus.distance_km || '12.5'
            });
          } else if (routesList.length > 0) {
            setSelectedRouteId(String(routesList[0].id));
            setCurrentRoute(routesList[0]);
          }

          if (bus?.bus_status === 'in_transit') {
            setTripActive(true);
          }
        }
      } catch (err) {
        console.warn('Error loading driver dashboard data', err);
      }
    } else {
      setAllRoutes(mockRoutes);
      setCurrentRoute(mockRoutes[0]);
      setSelectedRouteId(String(mockRoutes[0].id));
      setAssignedBus({ bus_number: 'NSTU-01', capacity: 52 });
      setSchedules(mockSchedules);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, [driverId]);

  // GPS Telemetry with Fallback Simulation for Desktop & Devices
  useEffect(() => {
    let watchId;
    let simInterval;

    if (tripActive) {
      let hasRealGPS = false;
      const targetBusId = assignedBus?.bus_id || assignedBus?.id || 1;
      let step = 0;

      const baseLat = 22.7925;
      const baseLng = 91.1002;

      const broadcastStep = () => {
        step = (step + 1) % 60;
        const curLat = baseLat + (step * 0.0007);
        const curLng = baseLng + (step * 0.0005);
        const curSpeed = Math.floor(Math.random() * 10) + 32;

        if (USE_REAL_PHP_BACKEND) {
          DriverAPI.updateGPS({
            driver_id: driverId,
            bus_id: targetBusId,
            lat: Number(curLat.toFixed(6)),
            lng: Number(curLng.toFixed(6)),
            speed: curSpeed,
            status: 'in_transit'
          });
        }
      };

      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            hasRealGPS = true;
            if (simInterval) { clearInterval(simInterval); simInterval = null; }
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const speed = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 36;
            
            if (USE_REAL_PHP_BACKEND) {
              DriverAPI.updateGPS({
                driver_id: driverId,
                bus_id: targetBusId,
                lat,
                lng,
                speed,
                status: 'in_transit'
              });
            }
          },
          (error) => {
            console.warn('Real GPS unavailable, using active telemetry simulator', error);
            if (!simInterval) {
              broadcastStep();
              simInterval = setInterval(broadcastStep, 3500);
            }
          },
          { enableHighAccuracy: true, maximumAge: 4000, timeout: 4000 }
        );
      } else {
        broadcastStep();
        simInterval = setInterval(broadcastStep, 3500);
      }

      const fallbackTimer = setTimeout(() => {
        if (!hasRealGPS && !simInterval) {
          broadcastStep();
          simInterval = setInterval(broadcastStep, 3500);
        }
      }, 4000);

      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        if (simInterval) clearInterval(simInterval);
        clearTimeout(fallbackTimer);
      };
    } else if (!tripActive && USE_REAL_PHP_BACKEND) {
      if (driverId) {
        const targetBusId = assignedBus?.bus_id || assignedBus?.id || 1;
        DriverAPI.updateGPS({
          driver_id: driverId,
          bus_id: targetBusId,
          lat: 22.7925,
          lng: 91.1002,
          speed: 0,
          status: 'active'
        });
      }
    }
  }, [tripActive, driverId, assignedBus]);

  const handleStartTrip = async () => {
    const targetBusId = assignedBus?.bus_id || assignedBus?.id || 1;
    const targetRouteId = currentRoute?.id || Number(selectedRouteId) || 1;

    if (USE_REAL_PHP_BACKEND) {
      const res = await DriverAPI.controlTrip({
        driver_id: driverId,
        action: 'start',
        route_id: targetRouteId,
        bus_id: targetBusId
      });
      if (res && res.success) {
        setTripActive(true);
        // Immediately broadcast initial location
        DriverAPI.updateGPS({
          driver_id: driverId,
          bus_id: targetBusId,
          lat: 22.7925,
          lng: 91.1002,
          speed: 35,
          status: 'in_transit'
        });
        toast.success(`Trip started on ${currentRoute?.route_name || 'Assigned Route'}! Live GPS broadcasting 🛰️`);
      } else {
        toast.error(res?.message || 'Failed to start trip');
      }
    } else {
      setTripActive(true);
      toast.success('Trip started! Live GPS telemetry is broadcasting.');
    }
  };

  const handleEndTrip = async () => {
    const targetBusId = assignedBus?.bus_id || assignedBus?.id || 1;
    if (USE_REAL_PHP_BACKEND) {
      const res = await DriverAPI.controlTrip({
        driver_id: driverId,
        action: 'end',
        bus_id: targetBusId
      });
      if (res && res.success) {
        setTripActive(false);
        DriverAPI.updateGPS({
          driver_id: driverId,
          bus_id: targetBusId,
          lat: 22.7925,
          lng: 91.1002,
          speed: 0,
          status: 'active'
        });
        toast.success('Trip ended successfully! 🏁');
      } else {
        toast.error(res?.message || 'Failed to end trip');
      }
    } else {
      setTripActive(false);
      toast.success('Trip ended successfully!');
    }
  };

  // Switch Route Function
  const handleRouteChange = async () => {
    if (!selectedRouteId) return;
    const routeObj = allRoutes.find(r => String(r.id) === String(selectedRouteId));
    if (!routeObj) return;

    setChangingRoute(true);
    if (USE_REAL_PHP_BACKEND) {
      try {
        const res = await DriverAPI.updateRoute({
          driver_id: driverId,
          route_id: Number(selectedRouteId),
          bus_id: assignedBus?.bus_id || assignedBus?.id || 1
        });

        if (res && res.success) {
          setCurrentRoute(routeObj);
          setAssignedBus(prev => ({ ...prev, route_id: routeObj.id, route_name: routeObj.route_name }));
          toast.success(`Active route updated to: ${routeObj.route_name} 🚍`);
        } else {
          toast.error(res?.message || 'Failed to switch route');
        }
      } catch (e) {
        toast.error('Network error switching route');
      } finally {
        setChangingRoute(false);
      }
    } else {
      setCurrentRoute(routeObj);
      toast.success(`Route switched to: ${routeObj.name || routeObj.route_name}`);
      setChangingRoute(false);
    }
  };

  const myStudents = mockStudents.filter(s => s.bus === (assignedBus?.bus_number || 'NSTU-01'));

  return (
    <div className="page-container p-4 lg:p-6 fade-in space-y-6">
      <PageHeader
        title={`Driver Portal • ${user?.name}`}
        subtitle="Live trip controller, GPS telemetry broadcast, and route switcher"
      />

      {/* Trip Control Banner */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden shadow-2xl ${
        tripActive
          ? 'bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/60 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
          : 'bg-[#161b22]/70 border-[#30363d]'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              tripActive ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-[#21262d] border border-[#30363d]'
            }`}>
              <Bus size={28} className={tripActive ? 'text-emerald-400 animate-pulse' : 'text-[#8b949e]'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${tripActive ? 'bg-emerald-400 animate-ping' : 'bg-[#484f58]'}`} />
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  {tripActive ? 'Active GPS Trip Broadcasting' : 'Bus Idle at Terminal'}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-white font-['Outfit'] mt-0.5">
                Bus {assignedBus?.bus_number || 'NSTU-01'} • {currentRoute?.route_name || 'Route A'}
              </div>
              <div className="text-xs text-[#8b949e]">
                Driver: <span className="text-white font-bold">{user?.name}</span> • Fleet ID: #{assignedBus?.bus_id || 1}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!tripActive ? (
              <button onClick={handleStartTrip} className="btn btn-success py-3 px-6 text-sm font-extrabold shadow-lg">
                <PlayCircle size={18} /> Broadcast & Start Trip
              </button>
            ) : (
              <button onClick={handleEndTrip} className="btn btn-danger py-3 px-6 text-sm font-extrabold shadow-lg">
                <StopCircle size={18} /> Complete & End Trip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Route Switcher Bar */}
      <div className="p-5 rounded-2xl bg-[#161b22] border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Compass size={18} className="text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Change Trip Route</div>
            <div className="text-sm font-extrabold text-white">
              Currently Selected: <span className="text-cyan-400">{currentRoute?.route_name || 'Loading route...'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="form-input text-xs py-2 px-3 font-semibold min-w-[220px]"
          >
            {allRoutes.map(r => (
              <option key={r.id} value={r.id}>
                {r.route_name || r.name} ({r.distance_km || '12'} km)
              </option>
            ))}
          </select>
          <button
            onClick={handleRouteChange}
            disabled={changingRoute || String(selectedRouteId) === String(currentRoute?.id)}
            className="btn btn-primary text-xs py-2 px-4 shrink-0 font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCw size={13} className={changingRoute ? 'animate-spin' : ''} />
            Switch Route
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bus} label="Assigned Bus" value={assignedBus?.bus_number || 'NSTU-01'} color="primary" />
        <StatCard icon={Navigation} label="Current Route" value={currentRoute?.route_name?.split('-')[0]?.trim() || 'Route A'} color="purple" />
        <StatCard icon={Users} label="Scanned Riders" value={passengersCount} color="success" />
        <StatCard icon={Clock} label="Today's Shifts" value={`${schedules.length} Shifts`} color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <SectionCard title="Assigned Timetable Shifts" subtitle="Live schedule list for today">
          <div className="space-y-3">
            {schedules.length > 0 ? (
              schedules.map(s => (
                <div key={s.id} className="p-4 bg-[#0d1117]/80 rounded-2xl border border-[#21262d]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-amber-500/15 border border-amber-500/30">
                        <Clock size={20} className="text-amber-400" />
                      </div>
                      <div>
                        <div className="font-extrabold text-white capitalize text-sm font-['Outfit']">{s.shift || 'Morning'} Shift Loop</div>
                        <div className="text-xs text-[#8b949e]">{s.route_name || currentRoute?.route_name || 'Active Route'}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-base font-extrabold text-white">{s.departure_time?.slice(0,5) || '08:00 AM'}</div>
                      <div className="text-xs text-blue-400 font-semibold">ETA: {s.arrival_time?.slice(0,5) || '08:45 AM'}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#8b949e] p-6 text-center">
                No active fixed timetable shifts today. On-demand trips can be started anytime using the controller above.
              </div>
            )}
          </div>
        </SectionCard>

        {/* Live Route Telemetry */}
        <SectionCard title="Route Navigation HUD" subtitle="Real-time radar for current route">
          <div className="map-placeholder h-60 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Navigation size={28} className="text-blue-400 animate-bounce" />
            </div>
            <div className="text-base font-extrabold text-white font-['Outfit']">
              {currentRoute?.route_name || 'Route A - Sonapur Express'}
            </div>
            <div className="text-xs text-[#8b949e] mt-1">
              Path: {currentRoute?.start_location || 'Campus'} → {currentRoute?.end_location || 'Maijdee'}
            </div>
            {tripActive && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
                <Radio size={12} className="text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">Live GPS Signal Active</span>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Student List */}
      <SectionCard title="Assigned Student Riders Manifest" subtitle={`${myStudents.length} riders registered for this bus`}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Dept & ID</th>
                <th>Boarding Stop</th>
                <th>Attendance Rate</th>
                <th>Pass Status</th>
              </tr>
            </thead>
            <tbody>
              {myStudents.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-xs font-extrabold text-white shadow-md">
                        {s.name.charAt(0)}
                      </div>
                      <div className="font-bold text-white text-sm font-['Outfit']">{s.name}</div>
                    </div>
                  </td>
                  <td className="text-xs text-[#8b949e]">{s.dept} · <span className="font-mono">{s.studentId}</span></td>
                  <td className="text-xs text-blue-400 font-semibold">{s.stop}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#21262d] rounded-full w-20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${s.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white font-mono">{s.attendance}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
