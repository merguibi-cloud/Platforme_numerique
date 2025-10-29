import { FormateurSidebar } from '../components/FormateurSidebar';
import FormateurDashboardContent from '../components/FormateurDashboardContent';

export default function FormateurDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <FormateurSidebar />
      <FormateurDashboardContent />
    </div>
  );
}


