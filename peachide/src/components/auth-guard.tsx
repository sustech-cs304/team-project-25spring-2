"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserContext } from "@/app/UserEnvProvider";

// Paths that don't require authentication
const publicPaths = ['/auth'];

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip checking during SSR
    if (typeof window === 'undefined') return;
    
    // Check if current path is public or requires auth
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    
    if (!isAuthenticated && !isPublicPath) {
      // Redirect to login if not authenticated and not on a public path
      router.push('/auth');
    } else if (isAuthenticated && pathname === '/auth') {
      // Redirect to homepage if already authenticated and on auth page
      router.push('/');
    }
    
    setIsChecking(false);
  }, [isAuthenticated, pathname, router]);

  // Don't render anything until we've checked authentication
  if (isChecking) {
    return null;
  }

  // If on a public path or authenticated, render the children
  if (publicPaths.some(path => pathname.startsWith(path)) || isAuthenticated) {
    return <>{children}</>;
  }

  // This should never be reached due to redirects, but just in case
  return null;
};

export default AuthGuard; 