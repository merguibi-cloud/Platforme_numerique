import { AdminSidebar } from '../components/AdminSidebar';
import { UserManagement } from '../components/UserManagement';
import { AdminGuard } from '@/components/RoleGuard';

export default function GestionUtilisateurs() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F8F5E4] flex">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <UserManagement />
        </div>
      </div>
    </AdminGuard>
  );
}
