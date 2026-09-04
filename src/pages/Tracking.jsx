import { useState, useEffect, useCallback } from 'react';
import { Navigation, MapPin, Clock, Bus, Gauge, Wifi, Radio, Sparkles, RefreshCw, Signal, AlertCircle } from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui/SharedComponents';
import { mockStops } from '../data/mockData';
import InteractiveMap from '../components/map/InteractiveMap';
import { TrackingAPI, USE_REAL_PHP_BACKEND } from '../services/api';

// Fallback mock data if API is unavailable
const fallbackBuses = [
  { id: 1, bus: 'NSTU-01', lat: 22.8120, lng: 91.0980, speed: 44, status: 'in_transit', driver: 'Md. Karim Uddin', route: 'Route A - Sonapur Express', stop: 'Approaching Sonapur Zero Point', eta: '2 min', last_updated: new Date().toISOString() },
  { id: 2, bus: 'NSTU-02', lat: 22.8640, lng: 91.0970, speed: 0, status: 'active', driver: 'Md. Alam Hossain', route: 'Route B - Chowmuhani Shuttle', stop: 'At Stop: Maijdee Court', eta: 'At Stop', last_updated: new Date().toISOString() },
];

// Normalize raw API bus data into a consistent shape
function normalizeBus(b) {
  const isMoving = b.status === 'in_transit';
  return {
    id:           Number(b.id),
    bus:          b.bus || b.bus_number || `Bus #${b.id}`,
    lat:          parseFloat(b.lat)   || parseFloat(b.current_lat)   || 22.79,
    lng:          parseFloat(b.lng)   || parseFloat(b.current_lng)   || 91.10,
    speed:        parseInt(b.speed)   || parseInt(b.speed_kmh)       || 0,
    status:       b.status            || 'inactive',
    driver:       b.driver            || 'Unassigned',
    route:        b.route             || b.route_name || 'No Route',
    stop:         isMoving ? 'In Transit' : 'At Terminal',
    eta:          isMoving ? 'Live Tracking' : 'Idle',
    last_updated: b.last_updated      || new Date().toISOString(),
  };
}

// How long ago was last_updated?
function timeAgo(isoStr) {
  if (!isoStr) return 'Unknown';
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 10)  return 'Just now';
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const POLL_INTERVAL_MS = 5000; // 5 seconds

export default function TrackingPage() {
  const [buses,       setBuses]       = useState(fallbackBuses);
  const [selectedBus, setSelectedBus] = useState(fallbackBuses[0]);
  const [lastFetch,   setLastFetch]   = useState(null);
  const [apiStatus,   setApiStatus]   = useState('connecting'); // 'live' | 'fallback' | 'connecting'
  const [tickCount,   setTickCount]   = useState(0); // force re-render for timeAgo

  // ─── Fetch live bus data from PHP/MySQL ───────────────────────────
  const fetchBusData = useCallback(async () => {
    if (!USE_REAL_PHP_BACKEND) {
      setApiStatus('fallback');
      return;
    }
    try {
      const res = await TrackingAPI.getBuses();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeBus);
        setBuses(normalized);
        setSelectedBus(prev => {
          // Keep selected bus in sync (update its data if it still exists)
          const updated = normalized.find(b => b.id === prev?.id);
          return updated || normalized[0];
        });
        setLastFetch(new Date());
        setApiStatus('live');
      } else {
        // API responded but no buses yet — stay on fallback
        setApiStatus('fallback');
      }
    } catch {
      setApiStatus('fallback');
    }
  }, []);

  // Initial fetch + polling every 5 seconds
  useEffect(() => {
    fetchBusData();
    const poll = setInterval(fetchBusData, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [fetchBusData]);

  // Tick every second so timeAgo() stays fresh visually
  useEffect(() => {
    const tick = setInterval(() => setTickCount(t => t + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  const activeBuses   = buses.filter(b => b.status === 'in_transit');
  const inactiveBuses = buses.filter(b => b.status !== 'in_transit');

  return (
    <div className="page-container p-4 lg:p-6 fade-in space-y-6">
      <PageHeader
        title="Live GPS Fleet Tracking"
        subtitle="Real-time satellite positioning — auto-refreshes every 5 seconds from database"
        action={
          <div className="flex items-center gap-3">
            {/* Manual refresh */}
            <button
              onClick={fetchBusData}
              className="btn btn-sm btn-secondary shadow-lg"
              title="Refresh now"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            {/* API status badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-lg text-xs font-bold ${
              apiStatus === 'live'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : apiStatus === 'connecting'
                ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  apiStatus === 'live' ? 'bg-emerald-400' : apiStatus === 'connecting' ? 'bg-blue-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  apiStatus === 'live' ? 'bg-emerald-500' : apiStatus === 'connecting' ? 'bg-blue-500' : 'bg-amber-500'
                }`} />
              </span>
              {apiStatus === 'live'
                ? `Live DB · ${lastFetch ? lastFetch.toLocaleTimeString() : ''}`
                : apiStatus === 'connecting'
                ? 'Connecting...'
                : 'Mock Data Mode'}
            </div>
          </div>
        }
      />

      {/* Info banner when using fallback */}
      {apiStatus === 'fallback' && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>
            <strong>Demo Mode:</strong> Could not reach the database. Showing sample bus positions.
            Make sure XAMPP is running and the <code className="text-amber-400 bg-amber-500/10 px-1 rounded">nstu_bus_tracker</code> database has seeded buses.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Bus Selector Sidebar ──────────────────────────────── */}
        <div className="lg:col-span-1 space-y-3">
          {/* Active / in-transit buses */}
          <div className="flex items-center justify-between text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2">
            <span>Active Fleet ({activeBuses.length})</span>
            <Signal size={13} className="text-emerald-400" />
          </div>

          {activeBuses.length === 0 && (
            <div className="p-4 rounded-2xl bg-[#161b22]/50 border border-[#21262d] text-center">
              <Bus size={24} className="mx-auto text-[#484f58] mb-2" />
              <p className="text-xs text-[#484f58]">No buses currently in transit</p>
              <p className="text-[10px] text-[#484f58] mt-1">Driver must start a trip first</p>
            </div>
          )}

          {activeBuses.map(b => {
            const isSelected = selectedBus?.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBus(b)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-[1.02]'
                    : 'bg-[#161b22]/70 border-[#21262d] hover:border-[#30363d] hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-white text-base font-['Outfit'] flex items-center gap-2">
                    <Bus size={18} className={isSelected ? 'text-blue-400' : 'text-[#8b949e]'} />
                    {b.bus}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="text-xs text-[#8b949e] mb-1 truncate">{b.route}</div>
                <div className="text-xs text-blue-400 truncate font-semibold">{b.stop}</div>

                <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-[#21262d]/60 text-xs">
                  <div>
                    <span className="text-[10px] text-[#484f58] block uppercase">Speed</span>
                    <span className="text-white font-mono font-bold">{b.speed} km/h</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#484f58] block uppercase">Updated</span>
                    <span className="text-amber-400 font-bold">{timeAgo(b.last_updated)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#484f58] mt-1.5 truncate">Driver: {b.driver}</div>
              </button>
            );
          })}

          {/* Inactive / parked buses */}
          {inactiveBuses.length > 0 && (
            <>
              <div className="text-xs font-bold text-[#484f58] uppercase tracking-wider mt-4 mb-2">
                Parked / Offline ({inactiveBuses.length})
              </div>
              {inactiveBuses.map(b => (
                <div key={b.id} className="p-3.5 rounded-xl bg-[#161b22]/40 border border-[#21262d]/50 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#8b949e] text-xs">{b.bus}</span>
                      <div className="text-[10px] text-[#484f58]">{b.driver}</div>
                    </div>
                    <span className={`badge ${
                      b.status === 'maintenance' ? 'badge-warning' :
                      b.status === 'active' ? 'badge-info' : 'badge-danger'
                    } text-[10px]`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ── Map + Telemetry ───────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Map — passes ALL active buses + selected */}
          <InteractiveMap
            buses={activeBuses.length > 0 ? activeBuses : buses}
            selectedBus={selectedBus}
            onSelectBus={setSelectedBus}
          />

          {/* Telemetry Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 section-card p-4">
            <div className="flex items-center gap-3 justify-center border-r border-amber-500/20">
              <Gauge size={22} className="text-blue-400" />
              <div className="text-left">
                <div className="text-[10px] text-[#8b949e] uppercase font-bold">Speed</div>
                <div className="text-sm font-extrabold text-white font-mono">
                  {selectedBus?.speed ?? '--'} km/h
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center border-r border-amber-500/20">
              <Clock size={22} className="text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-[#8b949e] uppercase font-bold">Last Update</div>
                <div className="text-sm font-extrabold text-emerald-400">
                  {selectedBus ? timeAgo(selectedBus.last_updated) : '--'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <Wifi size={22} className="text-purple-400" />
              <div className="text-left">
                <div className="text-[10px] text-[#8b949e] uppercase font-bold">Poll Rate</div>
                <div className="text-sm font-extrabold text-purple-400">Every 5s</div>
              </div>
            </div>
          </div>

          {/* Selected bus detail + route stops */}
          {selectedBus && (
            <SectionCard
              title="Vehicle Telemetry"
              subtitle={`${selectedBus.bus} · ${selectedBus.route}`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Bus Number', value: selectedBus.bus },
                  { label: 'Driver',     value: selectedBus.driver },
                  { label: 'Status',     value: selectedBus.status },
                  { label: 'Lat / Lng',  value: `${Number(selectedBus.lat).toFixed(4)}, ${Number(selectedBus.lng).toFixed(4)}` },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d]">
                    <div className="text-[10px] text-[#484f58] uppercase mb-1">{item.label}</div>
                    <div className="text-xs font-bold text-white truncate">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Route stop timeline */}
              <div className="relative">
                <div className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Radio size={12} className="text-blue-400" />
                  Route Stops · {selectedBus.route}
                </div>
                <div className="space-y-3">
                  {mockStops.map((stop, i) => (
                    <div key={stop.id} className="flex items-start gap-3 relative">
                      {/* Connecting line */}
                      {i < mockStops.length - 1 && (
                        <div className="absolute left-[18px] top-10 w-px h-full bg-[#21262d] -z-0" />
                      )}
                      <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center flex-shrink-0 relative z-10 text-xs font-bold shadow-lg transition-all ${
                        i < 2
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : i === 2
                          ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_18px_rgba(59,130,246,0.5)] animate-pulse scale-110'
                          : 'bg-[#161b22] border-[#30363d] text-[#484f58]'
                      }`}>
                        {i < 2 ? '✓' : i === 2 ? '🚌' : i + 1}
                      </div>
                      <div className={`flex-1 p-3 rounded-xl border transition-all ${
                        i === 2
                          ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-blue-500/40 shadow-lg'
                          : 'bg-[#0d1117]/60 border-[#21262d]'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white text-sm font-['Outfit']">{stop.name}</div>
                          <div className="text-xs font-mono text-[#8b949e]">{stop.arrival}</div>
                        </div>
                        {i < 2  && <div className="text-xs font-semibold text-emerald-400 mt-0.5">✓ Passed</div>}
                        {i === 2 && <div className="text-xs font-semibold text-blue-400 mt-0.5 animate-pulse">🚌 Bus Approaching</div>}
                        {i > 2  && <div className="text-xs text-[#484f58] mt-0.5">Upcoming</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
