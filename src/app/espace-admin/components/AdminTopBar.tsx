"use client";

import { Bell } from "lucide-react";
import AdminProfileDropdown from "./AdminProfileDropdown";

interface AdminTopBarProps {
  notificationCount?: number;
  showNotifications?: boolean;
  className?: string;
}

export const AdminTopBar = ({
  notificationCount = 0,
  showNotifications = true,
  className = "",
}: AdminTopBarProps) => {
  const hasNotifications = showNotifications && notificationCount > 0;

  return (
    <div className={`flex justify-end items-center space-x-4 ${className} relative z-[99]`}>
      {showNotifications && (
        <div className="relative">
          <Bell className="w-6 h-6 text-[#032622]" />
          {hasNotifications && (
            <span className="absolute -top-2 -right-2 bg-[#D96B6B] text-white text-xs rounded-full px-1.5 py-0.5">
              {notificationCount}
            </span>
          )}
        </div>
      )}
      <AdminProfileDropdown />
    </div>
  );
};

export default AdminTopBar;

