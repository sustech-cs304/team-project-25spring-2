"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserContext } from "@/app/UserEnvProvider";

// 从环境变量读取模拟认证设置
const IS_MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

// 不需要认证的公共路径
const publicPaths = ['/auth'];

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 组件首次渲染后标记为已初始化
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // 服务端渲染时跳过
    if (typeof window === 'undefined') return;
    
    // 等待初始化完成
    if (!isInitialized) return;
    
    // 如果启用了mock认证，跳过验证
    if (IS_MOCK_AUTH) {
      setIsChecking(false);
      return;
    }
    
    // 检查当前路径是否为公共路径
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    
    if (!isAuthenticated && !isPublicPath) {
      // 未认证且不在公共路径，重定向到登录页
      router.push('/auth');
    } else if (isAuthenticated && pathname === '/auth') {
      // 已认证且在登录页，重定向到首页
      router.push('/');
    }
    
    setIsChecking(false);
  }, [isAuthenticated, pathname, router, isInitialized]);

  // 认证检查中且不在mock模式下，不渲染任何内容
  if (isChecking && isInitialized && !IS_MOCK_AUTH) {
    return null;
  }

  // 以下情况渲染子组件:
  // 1. 开启了模拟认证
  // 2. 在公共路径上
  // 3. 已通过认证
  if (IS_MOCK_AUTH || publicPaths.some(path => pathname.startsWith(path)) || isAuthenticated) {
    return <>{children}</>;
  }

  // 兜底返回，实际上不应该到达这里
  return null;
};

export default AuthGuard; 