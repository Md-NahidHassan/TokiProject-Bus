import { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, Bus, Gauge, Wifi, Radio, Sparkles, RefreshCw } from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui/SharedComponents';
import { mockBuses, mockStops } from '../data/mockData';
import InteractiveMap from '../components/map/InteractiveMap';

const initialBusPositions = [
  { id: 1, bus: 'NSTU-01', lat: 22.8120, lng: 91.0980, speed: 44, status: 'moving', stop: 'Approaching Sonapur Zero Point', eta: '2 min', driver: 'Md. Karim Uddin', route: 'Route A' },
  { id: 2, bus: 'NSTU-02', lat: 22.8640, lng: 91.0970, speed: 0, status: 'stopped', stop: 'At Stop: Maijdee Court', eta: 'At Stop', driver: 'Md. Alam Hossain', route: 'Route B' },
  { id: 4, bus: 'NSTU-04', lat: 22.9460, lng: 91.1020, speed: 52, status: 'moving', stop: 'En route to Chowmuhani', eta: '9 min', driver: 'Md. Salam', route: 'Route C' },
];

export default function TrackingPage() {
  const [buses, setBuses] = useState(initialBusPositions);
  const [selectedBus, setSelectedBus] = useState(initialBusPositions[0]);
  const [isSimulating, setIsSimulating] = useState(true);

  // Live simulation effect
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setBuses(prev => prev.map(b => {
        if (b.status === 'moving') {
          const speedVariance = Math.floor(Math.random() * 7) - 3;
          const latVariance = (Math.random() - 0.5) * 0.001;
          const lngVariance = (Math.random() - 0.5) * 0.001;
          const newSpeed = Math.max(25, Math.min(65, b.speed + speedVariance));
          return {
            ...b,
            speed: newSpeed,
            lat: Number((b.lat + latVariance).toFixed(4)),
            lng: Number((b.lng + lngVariance).toFixed(4)),
          };
        }
        return b;
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="page-container p-4 lg:p-6 fade-in space-y-6">
      <PageHeader
        title="Live GPS Fleet Tracking"
        subtitle="Real-time satellite positioning and route telemetry for NSTU buses"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`btn btn-sm ${isSimulating ? 'btn-success' : 'btn-secondary'} shadow-lg`}
            >
              <RefreshCw size={14} className={isSimulating ? 'animate-spin' : ''} />
              {isSimulating ? 'Live Simulation Active' : 'Simulation Paused'}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400">GPS Live Sync</span>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Bus Selector sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2">
            <span>Active Telemetry ({buses.length})</span>
            <Sparkles size={13} className="text-blue-400" />
          </div>

          {buses.map(b => {
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
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                    b.status === 'moving'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'moving' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {b.status === 'moving' ? 'In Transit' : 'At Stop'}
                  </span>
                </div>

                <div className="text-xs text-[#8b949e] mb-2 truncate">{b.stop}</div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#21262d]/60 text-xs">
                  <div>
                    <span className="text-[10px] text-[#484f58] block uppercase">Speed</span>
                    <span className="text-white font-mono font-bold">{b.speed} km/h</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#484f58] block uppercase">Next Stop ETA</span>
                    <span className="text-blue-400 font-bold">{b.eta}</span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Inactive buses */}
          <div className="text-xs font-bold text-[#484f58] uppercase tracking-wider mt-6 mb-2">Offline Fleet</div>
          {mockBuses.filter(b => b.status !== 'active').map(b => (
            <div key={b.id} className="p-3.5 rounded-xl bg-[#161b22]/40 border border-[#21262d]/50 opacity-60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#8b949e] text-xs">{b.busNumber} ({b.driver})</span>
                <span className={`badge ${b.status === 'maintenance' ? 'badge-warning' : 'badge-danger'} text-[10px]`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Real Interactive Google Maps Display & Telemetry */}
        <div className="lg:col-span-3 space-y-4">
          {/* Interactive Leaflet & Google Map Component */}
          <InteractiveMap
            buses={buses}
            selectedBus={selectedBus}
            onSelectBus={setSelectedBus}
          />

          {/* Telemetry Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 section-card p-4">
            <div className="flex items-center gap-3 justify-center border-r border-amber-500/20">
              <Gauge size={22} className="text-blue-400" />
              <div className="text-left">
                <div className="text-[10px] text-[#8b949e] uppercase font-bold">Speed Telemetry</div>
                <div className="text-sm font-extrabold text-white font-mono">{selectedBus?.speed} km/h</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center border-r border-amber-500/20">
              <Clock size={22} className="text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-[#8b949e] uppercase font-bold">Arrival ETA</div>
                <div className="text-sm font-extrabold text-emerald-400">{selectedBus?.eta}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <Wifi size={22} className="text-purple-400" />
              <div className="text-left">
                <div className="text-[10px] text-[#8b949e] uppercase font-bold">5G Signal Sync</div>
                <div className="text-sm font-extrabold text-purple-400">99.8% Live</div>
              </div>
            </div>
          </div>

          {/* Route stops timeline */}
          <SectionCard title="Route Stop Progression" subtitle={`Sequence of stops on ${selectedBus?.route}`}>
            <div className="relative pt-2">
              <div className="space-y-4">
                {mockStops.map((stop, i) => (
                  <div key={stop.id} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 relative z-10 text-xs font-bold shadow-lg transition-all ${
                      i < 2 ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                      i === 2 ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse scale-110' :
                      'bg-[#161b22] border-[#30363d] text-[#484f58]'
                    }`}>
                      {i < 2 ? '✓' : i === 2 ? '🚌' : i + 1}
                    </div>

                    <div className={`flex-1 p-4 rounded-2xl border transition-all ${
                      i === 2 
                        ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-blue-500/40 shadow-lg' 
                        : 'bg-[#0d1117]/60 border-[#21262d]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-sm font-['Outfit']">{stop.name}</div>
                        <div className="text-xs font-mono text-[#8b949e]">{stop.arrival}</div>
                      </div>
                      {i < 2 && <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">✓ Passed Stop</div>}
                      {i === 2 && <div className="text-xs font-semibold text-blue-400 mt-1 flex items-center gap-1 animate-pulse">🚌 Bus Approaching</div>}
                      {i > 2 && <div className="text-xs text-[#484f58] mt-1">Upcoming Stop</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
