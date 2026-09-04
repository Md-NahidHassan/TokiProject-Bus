import { useState } from 'react';
import { User, Save, Camera, Key, Shield, Bell } from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui/SharedComponents';
import { useAuth } from '../context/AuthContext';
import { FACULTY_DEPARTMENTS } from '../data/departments';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const handleSave = () => {
    toast.success('Profile updated successfully!');
  };
  const handlePassword = () => {
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Passwords do not match!');
      return;
    }
    toast.success('Password changed successfully!');
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  const TABS = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'password', label: 'Password', icon: Key },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
  ];

  const roleColors = {
    super_admin: 'from-blue-600 to-purple-600',
    transport_admin: 'from-purple-600 to-pink-600',
    driver: 'from-cyan-600 to-blue-600',
    student: 'from-green-600 to-teal-600',
  };

  return (
    <div className="page-container p-6">
      <PageHeader title="My Profile" subtitle="Manage your account settings and preferences" />

      {/* Profile Card */}
      <div className="section-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColors[user?.role] || 'from-blue-600 to-purple-600'} flex items-center justify-center text-3xl font-bold text-white`}>
              {user?.name?.charAt(0)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div>
            <div className="text-xl font-bold text-white">{user?.name}</div>
            <div className="text-sm text-[#8b949e] mt-0.5">{user?.email}</div>
            <div className="text-sm text-[#8b949e]">{user?.department}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge badge-primary`}>{user?.role?.replace('_', ' ')}</span>
              {user?.studentId && <span className="badge badge-info">{user.studentId}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#161b22] rounded-xl border border-[#21262d] mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'gradient-primary text-white' : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <SectionCard title="Personal Information" action={<button onClick={handleSave} className="btn btn-primary btn-sm"><Save size={14} /> Save</button>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key:'name', label:'Full Name' },
              { key:'email', label:'Email Address', type:'email' },
              { key:'phone', label:'Phone Number' },
              { key:'department', label:'Department', type:'dept' },
            ].map(f => (
              <div key={f.key}>
                <label className="form-label">{f.label}</label>
                {f.type === 'dept' ? (
                  <select
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Select Department...</option>
                    {FACULTY_DEPARTMENTS.map(group => (
                      <optgroup key={group.faculty} label={group.faculty}>
                        {group.departments.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="form-input"
                  />
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === 'password' && (
        <SectionCard title="Change Password" action={<button onClick={handlePassword} className="btn btn-primary btn-sm"><Save size={14} /> Update</button>}>
          <div className="max-w-md space-y-4">
            {[
              { key:'current', label:'Current Password' },
              { key:'newPass', label:'New Password' },
              { key:'confirm', label:'Confirm New Password' },
            ].map(f => (
              <div key={f.key}>
                <label className="form-label">{f.label}</label>
                <input
                  type="password"
                  value={passwords[f.key]}
                  onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === 'notifications' && (
        <SectionCard title="Notification Preferences">
          <div className="space-y-4 max-w-md">
            {[
              { label: 'Bus Delay Alerts', desc: 'Get notified when your bus is delayed' },
              { label: 'Schedule Changes', desc: 'Notifications for route or schedule updates' },
              { label: 'Emergency Alerts', desc: 'Critical system alerts and emergencies' },
              { label: 'Complaint Updates', desc: 'Updates on your submitted complaints' },
              { label: 'Maintenance Notices', desc: 'Bus maintenance and service notices' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-xl border border-[#21262d]">
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-[#8b949e] mt-0.5">{item.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === 'security' && (
        <SectionCard title="Security Settings">
          <div className="space-y-4 max-w-md">
            <div className="p-4 bg-[#0d1117] rounded-xl border border-[#21262d]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
                  <div className="text-xs text-[#8b949e] mt-0.5">Add an extra layer of security to your account</div>
                </div>
                <button className="btn btn-sm btn-secondary">Enable</button>
              </div>
            </div>
            <div className="p-4 bg-[#0d1117] rounded-xl border border-[#21262d]">
              <div className="text-sm font-medium text-white mb-3">Recent Login Sessions</div>
              {[
                { ip: '103.45.67.89', device: 'Windows PC · Chrome', time: '2 hours ago', current: true },
                { ip: '192.168.1.10', device: 'Android · App', time: '1 day ago', current: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#21262d] last:border-0">
                  <div>
                    <div className="text-xs font-medium text-[#c9d1d9]">{s.device}</div>
                    <div className="text-[10px] text-[#484f58]">IP: {s.ip} · {s.time}</div>
                  </div>
                  {s.current ? (
                    <span className="badge badge-success text-[10px]">Current</span>
                  ) : (
                    <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
