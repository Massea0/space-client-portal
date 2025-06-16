
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'client@example.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'client',
    companyId: '1',
    companyName: 'Entreprise ABC',
    phone: '+221 77 123 45 67'
  },
  {
    id: '2',
    email: 'admin@arcadistech.com',
    firstName: 'Admin',
    lastName: 'Arcadis',
    role: 'admin',
    phone: '+221 77 987 65 43'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('arcadis_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = MOCK_USERS.find(u => u.email === credentials.email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('arcadis_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arcadis_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
