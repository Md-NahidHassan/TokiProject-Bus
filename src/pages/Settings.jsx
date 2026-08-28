import { useState } from 'react';
import { Settings, Save, University, Bell, Globe, Shield, Database } from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui/SharedComponents';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [tab, setTab] = useState('university');
  const [uni, setUni] = useState({
    name: 'Noakhali Science and Technology University',
    shortName: 'NSTU',
    address: 'Noakhali Sadar, Noakhali, Bangladesh',
    phone: '+880 321-000001',
    email: 'info@nstu.edu.bd',
    website: 'www.nstu.edu.bd',
    transport_email: 'transport@nstu.edu.bd',
    timezone: 'Asia/Dhaka',
  });

  const TABS = [
    { key: 'university', label: 'University', icon: University },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'system', label: 'System', icon: Settings },
  ];

  return (
    <div className="page-container p-6">
      <PageHeader title="System Settings" subtitle="Configure application settings and preferences" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'gradient-primary text-white' : 'bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-white'
            }`}
          >
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'university' && (
        <SectionCard title="University Information" action={<button onClick={() => toast.success('Settings saved!')} className="btn btn-primary btn-sm"><Save size={14} /> Save</button>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(uni).map(([key, val]) => (
              <div key={key}>
                <label className="form-label">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <input
                  type="text"
                  value={val}
                  onChange={e => setUni(p => ({ ...p, [key]: e.target.value }))}
                  className="form-input"
                />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === 'notifications' && (
        <SectionCard title="Notification Settings">
          <div className="space-y-4 max-w-lg">
            {[
              { label: 'Email Notifications', desc: 'Send notifications via email to students and drivers', checked: true },
              { label: 'SMS Notifications', desc: 'Send SMS alerts for urgent notifications', checked: false },
              { label: 'In-App Notifications', desc: 'Show notifications inside the application', checked: true },
              { label: 'Bus Delay Alert Threshold', desc: 'Alert when bus is delayed by more than (minutes)', type: 'number', value: 10 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-xl border border-[#21262d]">
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-[#8b949e] mt-0.5">{item.desc}</div>
                </div>
                {item.type === 'number' ? (
                  <input type="number" defaultValue={item.value} className="form-input w-20 text-center" />
                ) : (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#30363d] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === 'security' && (
        <SectionCard title="Security Settings">
          <div className="space-y-4 max-w-lg">
            {[
              { label: 'Rate Limiting', desc: 'Limit API requests per minute', type: 'number', value: 60 },
              { label: 'Session Timeout', desc: 'Auto logout after inactivity (minutes)', type: 'number', value: 30 },
              { label: 'Two-Factor Auth', desc: 'Require 2FA for admin accounts', checked: false },
              { label: 'Audit Logging', desc: 'Log all admin actions for accountability', checked: true },
              { label: 'IP Whitelisting', desc: 'Restrict admin access to specific IPs', checked: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-xl border border-[#21262d]">
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-[#8b949e] mt-0.5">{item.desc}</div>
                </div>
                {item.type === 'number' ? (
                  <input type="number" defaultValue={item.value} className="form-input w-20 text-center" />
                ) : (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#30363d] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                )}
              </div>
            ))}
            <button onClick={() => toast.success('Security settings saved!')} className="btn btn-primary">
              <Save size={16} /> Save Security Settings
            </button>
          </div>
        </SectionCard>
      )}

      {tab === 'system' && (
        <div className="grid gap-4">
          <SectionCard title="Database">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Database Size', value: '245 MB' },
                { label: 'Total Records', value: '12,450' },
                { label: 'Last Backup', value: '2024-04-10 03:00 AM' },
                { label: 'DB Version', value: 'MySQL 8.0.32' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-[#0d1117] rounded-xl border border-[#21262d]">
                  <div className="text-xs text-[#484f58] uppercase">{item.label}</div>
                  <div className="text-sm font-semibold text-white mt-1">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => toast.success('Backup started!')} className="btn btn-primary btn-sm">
                <Database size={14} /> Create Backup
              </button>
              <button onClick={() => toast.success('Cache cleared!')} className="btn btn-secondary btn-sm">
                Clear Cache
              </button>
            </div>
          </SectionCard>

          <SectionCard title="System Info">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'App Version', value: 'v1.0.0' },
                { label: 'Laravel Version', value: '12.x' },
                { label: 'PHP Version', value: '8.2' },
                { label: 'Server', value: 'Nginx 1.24' },
                { label: 'Uptime', value: '99.9%' },
                { label: 'Memory Usage', value: '512 MB / 2 GB' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-[#0d1117] rounded-xl border border-[#21262d]">
                  <div className="text-xs text-[#484f58] uppercase">{item.label}</div>
                  <div className="text-sm font-semibold text-white mt-1">{item.value}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
