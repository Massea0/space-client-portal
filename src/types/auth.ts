// src/types/auth.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'admin';
  companyId?: string;
  companyName?: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>; // Changed from () => void to () => Promise<void> as logout is async
  isLoading: boolean;
  error: string; // Added this line
}