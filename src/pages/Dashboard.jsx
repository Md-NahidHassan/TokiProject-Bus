import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import TransportAdminDashboard from './dashboards/TransportAdminDashboard';
import DriverDashboard from './dashboards/DriverDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'super_admin') return <SuperAdminDashboard />;
  if (user?.role === 'transport_admin') return <TransportAdminDashboard />;
  if (user?.role === 'driver') return <DriverDashboard />;
  if (user?.role === 'student') return <StudentDashboard />;
  return null;
}
