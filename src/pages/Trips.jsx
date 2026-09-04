import { useState, useEffect } from 'react';
import { 
  Bus, MapPin, Clock, Users, PlayCircle, StopCircle, Navigation, 
  Radio, RotateCw, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Compass 
} from 'lucide-react';
import { PageHeader, SectionCard, StatCard } from '../components/ui/SharedComponents';
import { useAuth } from '../context/AuthContext';
import { DriverAPI, AdminAPI, USE_REAL_PHP_BACKEND } from '../services/api';
import { mockRoutes, mockStudents, mockSchedules } from '../data/mockData';
import toast from 'react-hot-toast';

export default function TripsPage() {
  const { user } = useAuth();
  const driverId = user?.id || 3;

  const [tripActive, setTripActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignedBus, setAssignedBus] = useState(null);
  const [allRoutes, setAllRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [currentRoute, setCurrentRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [passengersCount, setPassengersCount] = useState(0);
  const [changingRoute, setChangingRoute] = useState(false);

  // Load Driver Profile & Assigned Fleet data
  const loadDriverData = async () => {
    if (USE_REAL_PHP_BACKEND) {
      try {
        setLoading(true);
        const res = await DriverAPI.getDashboard(driverId);
        if (res && res.success) {
          const bus = res.assigned_bus;
          setAssignedBus(bus);
          setSchedules(res.schedules || []);
          setPassengersCount(res.today_passengers_scanned || 0);

          const routesList = res.all_routes || [];
          setAllRoutes(routesList);

          // Find current active route
          if (bus?.route_id) {
            setSelectedRouteId(String(bus.route_id));
            const matched = routesList.find(r => r.id === bus.route_id);
            setCurrentRoute(matched || {
              id: bus.route_id,
              route_name: bus.route_name || 'Route A',
              start_location: bus.start_location || 'NSTU Campus',
              end_location: bus.end_location || 'City Terminal',
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
        console.warn('Error loading driver trips', err);
      } finally {
        setLoading(false);
      }
    } else {
      setAllRoutes(mockRoutes);
      setCurrentRoute(mockRoutes[0]);
      setSelectedRouteId(String(mockRoutes[0].id));
      setAssignedBus({ bus_number: 'NSTU-01', capacity: 52 });
      setSchedules(mockSchedules);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, [driverId]);

  // Handle Route Switch / Change
  const handleRouteChange = async () => {
    if (!selectedRouteId) {
      toast.error('Please select a route from the list');
      return;
    }

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
          toast.success(`Trip route switched to: ${routeObj.route_name} 🚍`);
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

  // GPS Telemetry broadcasting with Fallback Simulation for Desktops
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
          (pos) => {
            hasRealGPS = true;
            if (simInterval) { clearInterval(simInterval); simInterval = null; }
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 38;

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
          (err) => {
            console.warn('Real GPS unavailable, using active telemetry simulator', err);
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
        toast.error(res?.message || 'Could not start trip');
      }
    } else {
      setTripActive(true);
      toast.success('Trip started! Live telemetry active.');
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
        toast.success('Trip successfully completed & ended! 🏁');
      } else {
        toast.error(res?.message || 'Could not end trip');
      }
    } else {
      setTripActive(false);
      toast.success('Trip completed.');
    }
  };

  return (
    <div className="page-container p-4 lg:p-6 space-y-6 fade-in">
      <PageHeader
        title={`My Trips • Route Operations`}
        subtitle="Control live bus trips, switch active routes on demand, and broadcast GPS telemetry"
      />

      {/* Main Trip Status Controller */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden shadow-2xl ${
        tripActive
          ? 'bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-900/70 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.25)]'
          : 'bg-[#161b22]/80 border-[#30363d]'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border ${
              tripActive ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-[#21262d] border-[#30363d]'
            }`}>
              <Bus size={32} className={tripActive ? 'text-emerald-400 animate-pulse' : 'text-[#8b949e]'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${tripActive ? 'bg-emerald-400 animate-ping' : 'bg-[#484f58]'}`} />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  {tripActive ? 'Active Trip in Progress' : 'Bus Idle at Campus Terminal'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
                Bus {assignedBus?.bus_number || 'NSTU-01'} • {currentRoute?.route_name || 'Route A'}
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Driver: <span className="text-amber-400 font-bold">{user?.name}</span> • Fleet Capacity: {assignedBus?.capacity || 52} seats
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!tripActive ? (
              <button onClick={handleStartTrip} className="btn btn-success py-3.5 px-8 text-sm font-black shadow-xl flex items-center gap-2">
                <PlayCircle size={20} /> Start Trip on This Route
              </button>
            ) : (
              <button onClick={handleEndTrip} className="btn btn-danger py-3.5 px-8 text-sm font-black shadow-xl flex items-center gap-2">
                <StopCircle size={20} /> End Trip & Stop GPS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Route Switcher Card */}
      <div className="p-6 rounded-3xl bg-[#161b22]/90 border border-amber-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Compass size={14} /> Driver Route Switcher
            </div>
            <h3 className="text-lg font-extrabold text-white font-['Outfit'] mt-0.5">
              Change Your Active Trip Route
            </h3>
            <p className="text-xs text-[#8b949e]">
              Need to drive a different route today? Select the route below to update live tracking and notify riders.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="form-input text-sm py-2.5 px-4 font-semibold min-w-[260px]"
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
              className="btn btn-primary py-2.5 px-5 text-xs font-black shadow-lg shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCw size={14} className={changingRoute ? 'animate-spin' : ''} />
              Switch Route
            </button>
          </div>
        </div>

        {/* Current Active Route Breakdown */}
        {currentRoute && (
          <div className="p-4 rounded-2xl bg-[#0d1117]/80 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <MapPin size={18} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-[#8b949e] font-semibold">Active Destination Path</div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>{currentRoute.start_location || 'NSTU Campus'}</span>
                  <ArrowRight size={14} className="text-amber-400" />
                  <span>{currentRoute.end_location || 'Maijdee'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#c9d1d9] font-mono">
              <div>
                <span className="text-[#8b949e] block text-[10px] uppercase font-sans">Distance</span>
                <span className="font-bold text-white text-sm">{currentRoute.distance_km || '12.5'} km</span>
              </div>
              <div>
                <span className="text-[#8b949e] block text-[10px] uppercase font-sans">Estimated Time</span>
                <span className="font-bold text-cyan-400 text-sm">{currentRoute.estimated_minutes || '30'} mins</span>
              </div>
              <div>
                <span className="text-[#8b949e] block text-[10px] uppercase font-sans">Waypoints</span>
                <span className="font-bold text-amber-400 text-sm">{currentRoute.total_stops || '5'} stops</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bus} label="Assigned Bus" value={assignedBus?.bus_number || 'NSTU-01'} color="primary" />
        <StatCard icon={Navigation} label="Active Route" value={currentRoute?.route_name?.split('-')[0]?.trim() || 'Route A'} color="purple" />
        <StatCard icon={Users} label="Scanned Passengers" value={passengersCount} color="success" />
        <StatCard icon={Clock} label="Today's Shifts" value={`${schedules.length} Shifts`} color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedules for this driver */}
        <SectionCard title="Today's Assigned Timetable Shifts" subtitle="Schedules linked to this driver and bus">
          <div className="space-y-3">
            {schedules.length > 0 ? (
              schedules.map(s => (
                <div key={s.id} className="p-4 bg-[#0d1117]/80 rounded-2xl border border-[#21262d] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Clock size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm font-['Outfit'] capitalize">{s.shift} Shift Loop</div>
                      <div className="text-xs text-[#8b949e]">{s.route_name || currentRoute?.route_name || 'Active Route'}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-base font-extrabold text-white">{s.departure_time?.slice(0,5) || '08:00 AM'}</div>
                    <div className="text-xs text-blue-400 font-semibold">Arrival: {s.arrival_time?.slice(0,5) || '08:45 AM'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#8b949e] p-6 text-center">
                No specific schedule shifts assigned for today. You can start on-demand trips anytime using the controller above.
              </div>
            )}
          </div>
        </SectionCard>

        {/* Live Route HUD Status */}
        <SectionCard title="Live Route Telemetry HUD" subtitle="Satellite navigation & telemetry monitor">
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
            {tripActive ? (
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
                <Radio size={13} className="text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">Live GPS Signal Broadcasting to Riders</span>
              </div>
            ) : (
              <div className="mt-3 text-xs text-[#484f58] font-medium">
                Click "Start Trip on This Route" to begin real-time broadcasting
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
