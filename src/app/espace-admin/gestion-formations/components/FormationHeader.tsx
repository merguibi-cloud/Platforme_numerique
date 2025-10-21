'use client';

import { Bell, User } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  notificationCount?: number;
}

export const FormationHeader = ({ 
  userName = "Ymir Fritz", 
  userRole = "Admin", 
  notificationCount = 2 
}: HeaderProps) => {
  return (
    <header className="flex items-center justify-end gap-4">
      <button className="relative p-2 border border-[#032622] bg-[#F8F5E4] hover:bg-[#eae5cf] transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D96B6B] text-[10px] text-white">
          {notificationCount}
        </span>
      </button>
      <div className="flex items-center gap-3 border border-[#032622] bg-[#F8F5E4] px-4 py-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#032622]/10">
          <User className="w-5 h-5" />
        </span>
        <div>
          <p className="text-xs uppercase font-semibold tracking-[0.2em]">{userName}</p>
          <p className="text-[11px] text-[#032622]/70">{userRole}</p>
        </div>
      </div>
    </header>
  );
};
