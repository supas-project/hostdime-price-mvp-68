// Mock API config
export const API_BASE = 'http://localhost:3001';

export const api = {
  get: async (url: string) => {
    console.log('Mock API GET:', url);
    return { data: {} };
  },
  post: async (url: string, data: any) => {
    console.log('Mock API POST:', url, data);
    return { data: {} };
  }
};