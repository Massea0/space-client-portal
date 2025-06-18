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
  createdAt?: Date; // Gardé optionnel car il est parfois setté après coup
  isActive: boolean;
  deletedAt?: Date | null; // AJOUTÉ: Date de suppression logique
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string;
}