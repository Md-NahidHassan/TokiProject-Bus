import { useState, useEffect } from 'react';
import { Bell, Bus, Wrench, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { PageHeader, SectionCard, StatCard } from '../components/ui/SharedComponents';
import { mockNotifications } from '../data/mockData';
import { AdminAPI, USE_REAL_PHP_BACKEND } from '../services/api';

const typeConfig = {
  delay: { icon: Bus, color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', label: 'Delay' },
  maintenance: { icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30', label: 'Maintenance' },
  announcement: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', label: 'Announcement' },
  emergency: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', label: 'Emergency' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const loadData = async () => {
    if (USE_REAL_PHP_BACKEND) {
      const res = await AdminAPI.getNotifications();
      if (res && res.success) {
        setNotifications(res.data);
      }
    }
  };
  useEffect(() => { loadData(); }, []);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Notifications"
        subtitle="All system notifications and announcements"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Bell} label="Total" value={notifications.length} color="primary" />
        <StatCard icon={Bell} label="Unread" value={unread} color="warning" />
        <StatCard icon={AlertCircle} label="Emergency" value={notifications.filter(n=>n.type==='emergency').length} color="danger" />
        <StatCard icon={CheckCircle} label="Read" value={notifications.filter(n=>n.read).length} color="success" />
      </div>

      <SectionCard title="All Notifications">
        <div className="space-y-3">
          {notifications.map(n => {
            const tc = typeConfig[n.type] || typeConfig.announcement;
            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                  !n.read ? `${tc.bg}` : 'bg-[#0d1117] border-[#21262d]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                  <tc.icon size={18} className={tc.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{n.title}</span>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-[#8b949e] mt-0.5">{n.message}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-[#484f58]">{n.time}</div>
                      <span className={`badge mt-1 ${
                        n.priority === 'high' ? 'badge-danger' :
                        n.priority === 'medium' ? 'badge-warning' : 'badge-info'
                      }`}>{n.priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
