"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData } from './page';
import { toast } from 'sonner';
import { Home, Book } from "lucide-react";

const IS_MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

interface SidebarItem {
  title: string;
  url: string;
  icon: any;
}

interface UserContextType {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  userData: UserData | null;
  setUserData: (userData: UserData) => void;
  setIsTeacher: (isTeacher: boolean) => void;
  login: (token: string, userId: string, isTeacher: boolean) => void;
  logout: () => void;
  sidebarItems: SidebarItem[];
  setSidebarItems: (items: SidebarItem[]) => void;
}

const defaultSidebarItems: SidebarItem[] = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Classes",
    url: "/classes",
    icon: Book,
  },
];

const UserContext = createContext<UserContextType>({
  token: null,
  userId: null,
  isAuthenticated: false,
  isTeacher: false,
  userData: null,
  setIsTeacher: () => { },
  login: () => { },
  logout: () => { },
  setUserData: () => { },
  sidebarItems: defaultSidebarItems,
  setSidebarItems: () => { },
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(defaultSidebarItems);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/user");

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
        setIsTeacher(data ? data.is_teacher : false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user information');
      } finally {
      }
    };

    fetchUserData();
  }, [userId]);

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
  }, []);

  const login = (newToken: string, newUserId: string, newIsTeacher: boolean) => {
    setToken(newToken);
    setUserId(newUserId);
    setIsTeacher(newIsTeacher);
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

  const isAuthenticated = IS_MOCK_AUTH || !!token;

  return (
    <UserContext.Provider
      value={{
        token,
        userId,
        isAuthenticated,
        isTeacher,
        setIsTeacher,
        login,
        logout,
        userData,
        setUserData,
        sidebarItems,
        setSidebarItems,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
