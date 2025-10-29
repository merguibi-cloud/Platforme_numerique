'use client';
import { FormateurSidebar } from './components/FormateurSidebar';
import { useState } from 'react';

export default function FormateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F5E4]">
      <FormateurSidebar onCollapseChange={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}



