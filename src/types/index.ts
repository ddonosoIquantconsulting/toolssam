// types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'blocked';
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: string;
  password: string; // Solo para crear usuarios
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: string;
}

export interface ChangePasswordRequest {
  password: string;
}

// Other existing types...
export interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
}