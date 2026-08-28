import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Navigation, Bus, RefreshCw, Maximize2, ExternalLink } from 'lucide-react';

// Fix for default leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Tile Layer configurations
const TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  googleStreets: {
    name: 'Google Maps (Road)',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
  },
  googleSatellite: {
    name: 'Google Maps (Satellite)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
  },
};

export default function InteractiveMap({ buses, selectedBus, onSelectBus }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const [mapMode, setMapMode] = useState('leaflet'); // 'leaflet' | 'googleEmbed'
  const [tileKey, setTileKey] = useState('googleStreets');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // NSTU Coordinates
  const NSTU_CAMPUS = [22.7925, 91.1002];

  // Initialize Map
  useEffect(() => {
    if (mapMode !== 'leaflet' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: selectedBus ? [selectedBus.lat, selectedBus.lng] : NSTU_CAMPUS,
        zoom: 13,
        zoomControl: false,
      });

      // Add Zoom Control to top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layer and apply selected one
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const activeTile = TILE_LAYERS[tileKey];
    L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      maxZoom: 19,
    }).addTo(map);

    // Render bus markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    const routeCoords = [];

    buses.forEach(bus => {
      const coords = [bus.lat, bus.lng];
      routeCoords.push(coords);

      const isSelected = selectedBus?.id === bus.id;

      // Custom Bus Icon HTML
      const busIconHtml = `
        <div style="
          background: ${isSelected ? '#f59e0b' : '#2563eb'};
          color: white;
          padding: 6px 10px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 0 15px ${isSelected ? 'rgba(245,158,11,0.6)' : 'rgba(37,99,235,0.5)'};
          border: 2px solid white;
          transform: translate(-50%, -100%);
          white-space: nowrap;
          cursor: pointer;
        ">
          <span>🚌 ${bus.bus}</span>
          <span style="font-size: 9px; opacity: 0.9;">(${bus.speed} km/h)</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: busIconHtml,
        iconSize: [80, 30],
        iconAnchor: [40, 30],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; padding: 4px; color: #0f172a;">
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 2px; color: #d97706;">${bus.bus} (${bus.route})</div>
          <div style="font-size: 12px; margin-bottom: 4px;"><b>Driver:</b> ${bus.driver}</div>
          <div style="font-size: 12px; margin-bottom: 4px;"><b>Status:</b> ${bus.stop}</div>
          <div style="font-size: 12px; color: #059669; font-weight: 700;">Speed: ${bus.speed} km/h | ETA: ${bus.eta}</div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectBus) onSelectBus(bus);
      });

      markersRef.current[bus.id] = marker;
    });

    // Add Route Polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    if (routeCoords.length > 1) {
      polylineRef.current = L.polyline(routeCoords, {
        color: '#f59e0b',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85,
      }).addTo(map);
    }

    // Center map on selected bus if specified
    if (selectedBus) {
      map.panTo([selectedBus.lat, selectedBus.lng], { animate: true });
    }
  }, [mapMode, tileKey, buses, selectedBus]);

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-[#0d162a]">
      {/* Top Map Controls Header */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 bg-[#070d1a]/85 backdrop-blur-xl p-2.5 rounded-xl border border-amber-500/25">
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <button
            onClick={() => setMapMode('leaflet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapMode === 'leaflet'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-[#0d162a] text-[#94a3b8] hover:text-white border border-amber-500/20'
            }`}
          >
            <Navigation size={13} /> Live GPS Telemetry
          </button>

          <button
            onClick={() => setMapMode('googleEmbed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapMode === 'googleEmbed'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#0d162a] text-[#94a3b8] hover:text-white border border-amber-500/20'
            }`}
          >
            <MapPin size={13} className="text-red-400" /> Google Maps Direct
          </button>
        </div>

        {/* Map Layer Switcher dropdown for Leaflet */}
        {mapMode === 'leaflet' && (
          <div className="relative">
            <button
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0d162a] text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 flex items-center gap-1.5 transition-all"
            >
              <Layers size={13} /> {TILE_LAYERS[tileKey].name}
            </button>

            {isLayerMenuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-[#0b1224] border border-amber-500/30 rounded-xl p-1.5 shadow-2xl z-[1010]">
                {Object.entries(TILE_LAYERS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTileKey(key);
                      setIsLayerMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between ${
                      tileKey === key
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-[#94a3b8] hover:text-white hover:bg-[#161b22]'
                    }`}
                  >
                    <span>{item.name}</span>
                    {tileKey === key && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Map Rendering Area */}
      {mapMode === 'leaflet' ? (
        <div ref={mapContainerRef} className="w-full h-full z-10" />
      ) : (
        <iframe
          title="Google Maps NSTU Campus"
          className="w-full h-full border-0"
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14674.524458319692!2d91.0915638!3d22.7924748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3754af712aa56e59%3A0xd6f7d04f210a562d!2sNoakhali%20Science%20and%20Technology%20University!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd`}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      {/* External Google Maps Link Footer */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${selectedBus ? selectedBus.lat : NSTU_CAMPUS[0]},${selectedBus ? selectedBus.lng : NSTU_CAMPUS[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#070d1a]/90 backdrop-blur-md text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1.5 shadow-lg transition-all"
        >
          <ExternalLink size={12} /> Open in Google Maps App
        </a>
      </div>
    </div>
  );
}
