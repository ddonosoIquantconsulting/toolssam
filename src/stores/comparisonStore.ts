import { create } from 'zustand';
import { apiService } from '../services/api';
import { ComparisonResult } from '../types';

interface ComparisonStats {
  total: number;
  differences: number;
  matches: number;
  differencePercentage: number;
}

interface ComparisonState {
  comparisons: ComparisonResult[];
  stats: ComparisonStats | null;
  isLoading: boolean;
  error: string | null;
  compareCompanies: (company1: string, company2: string) => Promise<void>;
  getStats: () => Promise<void>;
  clearError: () => void;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  comparisons: [],
  stats: null,
  isLoading: false,
  error: null,

  compareCompanies: async (company1: string, company2: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await apiService.compareCompanies(company1, company2);
      set({
        comparisons: result.comparisons,
        stats: result.stats,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to compare companies',
        isLoading: false,
      });
    }
  },

  getStats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const stats = await apiService.getComparisonStats();
      set({ stats, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));