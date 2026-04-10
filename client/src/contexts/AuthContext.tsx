import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from '../../../src/common/user-role.enum';

interface User {
  username: string;
  role: UserRole;
  tenantId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');
    if (token) {
      const decoded: { username: string; role: UserRole; tenantId?: string } = jwtDecode(token);
      setUser({ username: decoded.username, role: decoded.role, tenantId: decoded.tenantId || tenantId || undefined });
      if (decoded.tenantId) {
        localStorage.setItem('tenantId', decoded.tenantId);
      }
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded: { username: string; role: UserRole; tenantId?: string } = jwtDecode(token);
    setUser({ username: decoded.username, role: decoded.role, tenantId: decoded.tenantId });
    if (decoded.tenantId) {
      localStorage.setItem('tenantId', decoded.tenantId);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
