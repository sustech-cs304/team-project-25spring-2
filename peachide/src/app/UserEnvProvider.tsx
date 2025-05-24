"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData } from './page';
import { toast } from 'sonner';
import { Home, Book, Settings, ComponentIcon, CodeXml } from "lucide-react";

const IS_MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

interface SidebarItem {
  title: string;
  url: string;
  icon: string;
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

// Base sidebar items every user should see
const baseSidebarItems: SidebarItem[] = [
  {
    title: "Home",
    url: "/",
    icon: "Home",
  },
];

// Student-specific sidebar items
const studentSidebarItems: SidebarItem[] = [
  {
    title: "Classes",
    url: "/classes",
    icon: "Book",
  },
];

// Teacher-specific sidebar items
const teacherSidebarItems: SidebarItem[] = [
  {
    title: "Manage",
    url: "/manage",
    icon: "Settings",
  },
];

// Initialize with base items
const defaultSidebarItems: SidebarItem[] = [...baseSidebarItems];

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
    if (sidebarItems !== defaultSidebarItems) {
      localStorage.setItem('sidebarItems', JSON.stringify(sidebarItems));
    }
  }, [sidebarItems]);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/user", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
        setIsTeacher(data ? data.is_teacher : false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user information');
      }
    };

    fetchUserData();
  }, [userId, token]);

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
    const storedSidebarItems = localStorage.getItem('sidebarItems');

    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
      setIsTeacher(storedIsTeacher);
    }

    if (storedSidebarItems) {
      setSidebarItems(JSON.parse(storedSidebarItems));
      console.log("storedSidebarItems", JSON.parse(storedSidebarItems));
    }
  }, []);

  const login = (newToken: string, newUserId: string, newIsTeacher: boolean) => {
    setToken(newToken);
    setUserId(newUserId);
    setIsTeacher(newIsTeacher);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('isTeacher', newIsTeacher.toString());
    if (newIsTeacher) {
      setSidebarItems([...defaultSidebarItems, ...teacherSidebarItems]);
      localStorage.setItem('sidebarItems', JSON.stringify([...defaultSidebarItems, ...teacherSidebarItems]));
      console.log("teacherSidebarItems", [...defaultSidebarItems, ...teacherSidebarItems]);
    } else {
      setSidebarItems([...defaultSidebarItems, ...studentSidebarItems]);
      localStorage.setItem('sidebarItems', JSON.stringify([...defaultSidebarItems, ...studentSidebarItems]));
      console.log("studentSidebarItems", [...defaultSidebarItems, ...studentSidebarItems]);
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setIsTeacher(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isTeacher');
    // Reset sidebar items to default when logging out
    setSidebarItems(defaultSidebarItems);
    localStorage.setItem('sidebarItems', JSON.stringify(defaultSidebarItems));
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

export const iconMap: Record<string, any> = {
  Home,
  Book,
  Settings,
  ComponentIcon,
  CodeXml,
};
