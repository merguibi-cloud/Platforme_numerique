import AdminDashboardContent from '../components/AdminDashboardContent';
import { AdminGuard } from '@/components/RoleGuard';

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
