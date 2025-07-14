// services/apiService.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

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

export interface CreateUserRequest {
  email: string;
  name: string;
  role: string;
  password?: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: string;
}

export interface ChangePasswordRequest {
  password: string;
}


interface ComparisonRequest {
  selection1: {
    company: string;
    version: string;
    uploadDate: string;
  };
  selection2: {
    company: string;
    version: string;
    uploadDate: string;
  };
  table?: string;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token a todas las peticiones
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        // console.log('Interceptor - Token encontrado:', token ? 'SÍ' : 'NO');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // console.log('Interceptor - Header agregado:', config.headers.Authorization);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          // Token expirado o inválido
          this.removeToken();
          // Solo redirigir si no estamos ya en login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Métodos para manejar el token
  private getToken(): string | null {
    const token = localStorage.getItem('authToken');
    // console.log('getToken llamado, token encontrado:', token ? 'SÍ' : 'NO');
    return token;
  }

  public setToken(token: string): void {
    // console.log('setToken llamado con:', token);
    localStorage.setItem('authToken', token);
    // console.log('Token guardado en localStorage:', localStorage.getItem('authToken'));
  }

  public removeToken(): void {
    // console.log('removeToken llamado');
    localStorage.removeItem('authToken');
  }

  // Método para hacer peticiones autenticadas
  private async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.request<T>(config);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Error en la petición';
      throw new Error(message);
    }
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // NO usar makeRequest para login porque no necesita token
      const response = await this.api.post('/auth/login', credentials);
      const data = response.data;
      
      // console.log('Login response:', data);
      
      // Guardar token inmediatamente
      if (data.access_token) {
        this.setToken(data.access_token);
        // console.log('Token guardado:', data.access_token);
        // console.log('Token en localStorage:', localStorage.getItem('authToken'));
      } else {
        console.error('No se recibió access_token en la respuesta');
      }
      
      return data;
    } catch (error: any) {
      // console.error('Error en login:', error);
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Error en login';
      throw new Error(message);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest({
        method: 'POST',
        url: '/auth/logout',
      });
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      this.removeToken();
    }
  }

  async getProfile(): Promise<User> {
    return this.makeRequest<User>({
      method: 'GET',
      url: '/auth/profile',
    });
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return this.makeRequest<User[]>({
      method: 'GET',
      url: '/users',
    });
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.makeRequest<User>({
      method: 'POST',
      url: '/users',
      data: userData,
    });
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return this.makeRequest<User>({
      method: 'PUT',
      url: `/users/${id}`,
      data: userData,
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.makeRequest<void>({
      method: 'DELETE',
      url: `/users/${id}`,
    });
  }

  async toggleUserStatus(id: string): Promise<User> {
    return this.makeRequest<User>({
      method: 'PATCH',
      url: `/users/${id}/toggle-status`,
    });
  }

  async changePassword(id: string, passwordData: ChangePasswordRequest): Promise<void> {
    return this.makeRequest<void>({
      method: 'PATCH',
      url: `/users/${id}/password`,
      data: passwordData,
    });
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Verificar si el token no ha expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Método para obtener información del usuario del token
  getCurrentUser(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  // File upload methods
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest({
      method: 'POST',
      url: '/files/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  async getFiles(): Promise<any[]> {
    return this.makeRequest({
      method: 'GET',
      url: '/files/history',
    });
  }

  // async getFiles(): Promise<any[]> {
  //   return this.makeRequest({
  //     method: 'GET',
  //     url: '/files',
  //   });
  // }

  async getFileData(company: string): Promise<any> {
    return this.makeRequest({
      method: 'GET',
      url: `/files/data?company=${company}`,
    });
  }

  async getAllData(): Promise<any[]> {
    return this.makeRequest({
      method: 'GET',
      url: '/files/data',
    });
  }

  async getCompanies(): Promise<string[]> {
    return this.makeRequest({
      method: 'GET',
      url: '/files/companies',
    });
  }

  async getVersions(): Promise<string[]> {
    return this.makeRequest({
      method: 'GET',
      url: '/files/versions',
    });
  }

  async deleteFile(id: string): Promise<void> {
    return this.makeRequest({
      method: 'DELETE',
      url: `/files/${id}`,
    });
  }

  async deleteFileByNameAndDate(filename: string, uploadDate: string): Promise<void> {
    // Codificar tanto el filename como la fecha para URL
    const encodedFilename = encodeURIComponent(filename);
    const encodedDate = encodeURIComponent(uploadDate);
    
    return this.makeRequest({
      method: 'DELETE',
      url: `/files/data/${encodedFilename}/${encodedDate}`,
    });
  }

  // Agregar este método en apiService.ts

async getTables(company: string, version: string, uploadDate: string): Promise<string[]> {
  const encodedCompany = encodeURIComponent(company);
  const encodedVersion = encodeURIComponent(version);
  const encodedUploadDate = encodeURIComponent(uploadDate);
  
  return this.makeRequest({
    method: 'GET',
    url: `/files/tables?company=${encodedCompany}&version=${encodedVersion}&uploadDate=${encodedUploadDate}`,
  });
}

// Agregar en apiService.ts


// async compareSelections(compareData: ComparisonRequest): Promise<any> {
//   return this.makeRequest({
//     method: 'POST',
//     url: '/files/compare',
//     data: compareData,
//   });
// }

// ✅ NUEVO MÉTODO
async compareUploads(compareData: {
  selection1: { fileName: string; uploadDate: string };
  selection2: { fileName: string; uploadDate: string };
  table: string;
}): Promise<any> {
  return this.makeRequest({
    method: 'POST',
    url: '/files/compare',
    data: compareData,
  });
}


}

export const apiService = new ApiService();