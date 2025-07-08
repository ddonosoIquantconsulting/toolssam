import { create } from 'zustand';
import { apiService } from '../services/api';
import { CSVData } from '../types';

interface FilesState {
  csvData: CSVData[];
  companies: string[];
  versions: string[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
  fetchData: (company?: string) => Promise<void>;
  fetchCompanies: () => Promise<void>;
  fetchVersions: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  clearError: () => void;
}

export const useFilesStore = create<FilesState>((set, get) => ({
  csvData: [],
  companies: [],
  versions: [],
  isLoading: false,
  error: null,
  uploadProgress: 0,

  fetchData: async (company?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await apiService.getFileData(company);
      set({ csvData: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        isLoading: false,
      });
    }
  },

  fetchCompanies: async () => {
    try {
      const companies = await apiService.getCompanies();
      set({ companies });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch companies',
      });
    }
  },

  fetchVersions: async () => {
    try {
      const versions = await apiService.getVersions();
      set({ versions });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch versions',
      });
    }
  },

  uploadFile: async (file: File) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        set(state => ({
          uploadProgress: Math.min(state.uploadProgress + 10, 90)
        }));
      }, 200);

      const result = await apiService.uploadFile(file);
      
      clearInterval(progressInterval);
      set({ uploadProgress: 100, isLoading: false });
      
      // Refresh data after upload
      await get().fetchData();
      await get().fetchCompanies();
      await get().fetchVersions();
      
      return result;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload file',
        isLoading: false,
        uploadProgress: 0,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));