import { useState } from 'react';
import { QrCode, Download, Bus, MapPin, User, Shield } from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui/SharedComponents';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

export default function BusPassPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'qr'

  const passData = JSON.stringify({
    name: user?.name,
    studentId: user?.studentId || 'CSE-2020-001',
    dept: user?.department,
    bus: user?.busAssigned || 'NSTU-01',
    route: user?.routeAssigned || 'Route A - Sylhet City',
    stop: user?.stopAssigned || 'Ambarkhana',
    valid: '2025-12-31',
    status: 'ACTIVE',
    university: 'NSTU - Noakhali Science and Technology University',
  });

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Digital Bus Pass"
        subtitle="Your official NSTU transport pass with QR code"
      />

      <div className="max-w-2xl mx-auto">
        {/* Toggle */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setViewMode('card')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${viewMode === 'card' ? 'gradient-primary text-white' : 'bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:text-white'}`}
          >
            Bus Pass Card
          </button>
          <button
            onClick={() => setViewMode('qr')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${viewMode === 'qr' ? 'gradient-primary text-white' : 'bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:text-white'}`}
          >
            QR Code
          </button>
        </div>

        {viewMode === 'card' && (
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 fade-in" style={{
            background: 'linear-gradient(135deg, #1a237e 0%, #283593 30%, #0d47a1 60%, #1565c0 100%)',
            boxShadow: '0 20px 60px rgba(21, 101, 192, 0.3)'
          }}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-24 -translate-x-24" />

            {/* Card content */}
            <div className="relative p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-white font-bold text-lg leading-tight">NSTU Transport</div>
                  <div className="text-blue-200 text-sm">Noakhali Science & Technology University</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Bus size={28} className="text-white" />
                </div>
              </div>

              <div className="text-[#93c5fd] text-xs font-semibold uppercase tracking-widest mb-1">Bus Pass</div>
              <div className="text-white text-3xl font-bold mb-1">{user?.name}</div>
              <div className="text-blue-200 text-sm mb-6">{user?.studentId || 'CSE-2020-001'} · {user?.department}</div>

              {/* Pass details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Bus, label: 'Bus Number', value: user?.busAssigned || 'NSTU-01' },
                  { icon: MapPin, label: 'Board Stop', value: user?.stopAssigned || 'Ambarkhana' },
                  { icon: MapPin, label: 'Route', value: 'Route A - Sylhet City' },
                  { icon: Shield, label: 'Valid Until', value: 'Dec 31, 2025' },
                ].map(item => (
                  <div key={item.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon size={12} className="text-blue-200" />
                      <span className="text-[10px] text-blue-200 uppercase tracking-wider">{item.label}</span>
                    </div>
                    <div className="text-white font-semibold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 text-sm font-semibold">ACTIVE</span>
                </div>
                <div className="text-blue-200 text-xs">Session 2024-25</div>
              </div>
            </div>

            {/* Bottom stripe */}
            <div className="h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400" />
          </div>
        )}

        {viewMode === 'qr' && (
          <div className="fade-in">
            <div className="section-card p-8 flex flex-col items-center text-center">
              <div className="mb-6">
                <div className="text-white font-bold text-lg">{user?.name}</div>
                <div className="text-[#8b949e] text-sm">{user?.studentId || 'CSE-2020-001'} · {user?.department}</div>
              </div>

              <div className="p-4 bg-white rounded-2xl mb-6 shadow-2xl">
                <QRCodeSVG
                  value={passData}
                  size={200}
                  level="H"
                  includeMargin={false}
                  fgColor="#0d1117"
                  bgColor="#ffffff"
                />
              </div>

              <div className="text-xs text-[#8b949e] mb-6 max-w-xs">
                Scan this QR code at the bus gate for attendance and bus pass verification
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                {[
                  { label: 'Bus', value: user?.busAssigned || 'NSTU-01' },
                  { label: 'Route', value: 'Route A' },
                  { label: 'Stop', value: user?.stopAssigned || 'Ambarkhana' },
                  { label: 'Valid', value: 'Dec 2025' },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-[#0d1117] rounded-xl border border-[#21262d] text-left">
                    <div className="text-xs text-[#484f58] uppercase">{item.label}</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary w-full justify-center">
                <Download size={16} /> Download Pass
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-[#484f58]">
          This is an official digital bus pass. Misuse is a punishable offense.
        </div>
      </div>
    </div>
  );
}
