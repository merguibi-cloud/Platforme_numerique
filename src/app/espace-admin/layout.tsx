'use client';
import { AdminSidebar } from './components/AdminSidebar';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F5E4]">
      <AdminSidebar isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}


