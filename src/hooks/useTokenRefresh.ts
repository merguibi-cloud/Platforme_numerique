'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const REFRESH_MARGIN_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

/**
 * Hook to proactively refresh tokens before they expire
 */
export function useTokenRefresh() {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const getTokenExpiry = useCallback((): number | null => {
    if (typeof document === 'undefined') return null;

    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('sb-access-token='))
      ?.split('=')[1];

    if (!accessToken) return null;

    try {
      // JWT structure: header.payload.signature
      const payload = accessToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
    } catch {
      return null;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) return false;
    isRefreshingRef.current = true;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        // Refresh failed - session is invalid
        const url = new URL(window.location.href);
        url.searchParams.set('session_expired', 'true');
        window.history.replaceState({}, '', url.toString());
        window.dispatchEvent(new Event('session_expired'));
        return false;
      }

      return true;
    } catch {
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  const checkAndRefresh = useCallback(async () => {
    const expiryTime = getTokenExpiry();
    if (!expiryTime) return;

    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // If token expires within the margin, refresh it
    if (timeUntilExpiry <= REFRESH_MARGIN_MS && timeUntilExpiry > 0) {
      await refreshToken();
    }
  }, [getTokenExpiry, refreshToken]);

  useEffect(() => {
    // Initial check
    checkAndRefresh();

    // Set up periodic check
    intervalRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkAndRefresh]);

  return { refreshToken };
}
