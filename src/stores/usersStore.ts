import { create } from 'zustand';
import { apiService } from '../services/api';
import { User } from '../types';

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (userData: any) => Promise<void>;
  updateUser: (id: string, userData: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  changePassword: (id: string, passwordData: any) => Promise<void>;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const users = await apiService.getUsers();
      set({ users, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        isLoading: false,
      });
    }
  },

  createUser: async (userData: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const newUser = await apiService.createUser(userData);
      set(state => ({
        users: [...state.users, newUser],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create user',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUser: async (id: string, userData: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedUser = await apiService.updateUser(id, userData);
      set(state => ({
        users: state.users.map(user => user.id === id ? updatedUser : user),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update user',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiService.deleteUser(id);
      set(state => ({
        users: state.users.filter(user => user.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete user',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleUserStatus: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedUser = await apiService.toggleUserStatus(id);
      set(state => ({
        users: state.users.map(user => user.id === id ? updatedUser : user),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle user status',
        isLoading: false,
      });
      throw error;
    }
  },

  changePassword: async (id: string, passwordData: any) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiService.changePassword(id, passwordData);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to change password',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));