import { AdminSidebar } from '../components/AdminSidebar';
import AdminDashboardContent from '../components/AdminDashboardContent';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <AdminSidebar />
      <AdminDashboardContent />
    </div>
  );
}
