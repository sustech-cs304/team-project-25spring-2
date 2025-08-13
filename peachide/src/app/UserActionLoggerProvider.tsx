"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import userActionLogger from '@/lib/userActionLogger';
import { useUserContext } from './UserEnvProvider';

export default function UserActionLoggerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathRef = useRef<string | null>(null);
  const { userId, userData } = useUserContext();

  // Initialize once
  useEffect(() => {
    userActionLogger.init();

    // Provide user resolver for the logger
    userActionLogger.setUserResolver(() => ({
      userId: userId ?? userData?.user_id ?? undefined,
      username: userData?.name || userData?.email || undefined,
    }));

    // Optional: wire a sender to a backend endpoint if available later
    // userActionLogger.setSender(async (log) => {
    //   await fetch('/api/logs/user-actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(log) });
    // });
  }, [userId, userData]);

  // Route change logging
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    const currentPath = hash || pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    const prev = previousPathRef.current ?? (hash || window.location.pathname + window.location.search);
    if (prev !== currentPath) {
      userActionLogger.logNavigation(prev, currentPath, document.title);
      previousPathRef.current = currentPath;
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}


