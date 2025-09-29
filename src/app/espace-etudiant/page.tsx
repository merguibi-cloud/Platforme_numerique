"use client";
import { useState } from 'react';
import { StudentSidebar } from './components/StudentSidebar';
import { StudentDashboard } from './components/StudentDashboard';

export default function EspaceEtudiantPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Sidebar gauche */}
      <StudentSidebar />
      
      {/* Contenu principal */}
      <div className="flex-1">
        <StudentDashboard />
      </div>
    </div>
  );
}

