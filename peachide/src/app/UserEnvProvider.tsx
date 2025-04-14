"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  token: null,
  userId: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Initialize from localStorage on client-side
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
    }
  }, []);

  const login = (newToken: string, newUserId: string) => {
    setToken(newToken);
    setUserId(newUserId);
    // Store in localStorage for persistence
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  return (
    <UserContext.Provider
      value={{
        token,
        userId,
        isAuthenticated: !!token,
        login,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
