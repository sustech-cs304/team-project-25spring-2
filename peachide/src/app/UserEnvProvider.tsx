"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const IS_MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

interface UserContextType {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  login: (token: string, userId: string, isTeacher: boolean) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  token: null,
  userId: null,
  isAuthenticated: false,
  isTeacher: false,
  login: () => { },
  logout: () => { },
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [initialized, setInitialized] = useState(false);

  // 初始化时从localStorage加载数据
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedIsTeacher = localStorage.getItem('isTeacher') === 'true';

    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
      setIsTeacher(storedIsTeacher);
    }

    setInitialized(true);
  }, []);

  const login = (newToken: string, newUserId: string, newIsTeacher: boolean) => {
    setToken(newToken);
    setUserId(newUserId);
    setIsTeacher(newIsTeacher);
    // 持久化存储
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('isTeacher', newIsTeacher.toString());
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setIsTeacher(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isTeacher');
  };

  // 根据环境变量和token确定认证状态
  const isAuthenticated = IS_MOCK_AUTH || !!token;

  return (
    <UserContext.Provider
      value={{
        token,
        userId,
        isAuthenticated,
        isTeacher,
        login,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
