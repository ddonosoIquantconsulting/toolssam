const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    console.log("login ");
    console.log({email, password});
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async register(userData: any) {
    console.log("registrar");
    console.log({userData});
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Users endpoints
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleUserStatus(id: string) {
    return this.request(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async changePassword(id: string, passwordData: any) {
    return this.request(`/users/${id}/change-password`, {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    });
  }

  // Files endpoints
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  async getFileData(company?: string) {
    const params = company ? `?company=${encodeURIComponent(company)}` : '';
    return this.request(`/files/data${params}`);
  }

  async getCompanies() {
    return this.request('/files/companies');
  }

  async getVersions() {
    return this.request('/files/versions');
  }

  // Comparison endpoints
  async compareCompanies(company1: string, company2: string) {
    const params = `?company1=${encodeURIComponent(company1)}&company2=${encodeURIComponent(company2)}`;
    return this.request(`/comparison/compare${params}`);
  }

  async getComparisonStats() {
    return this.request('/comparison/stats');
  }
}

export const apiService = new ApiService();