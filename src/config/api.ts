// Mock API config
export const API_BASE = 'http://localhost:3001';

export const API_CONFIG = {
  ENDPOINTS: {
    DATA: {
      CATEGORIES: '/api/categories',
      ITEMS: '/api/items'
    },
    AUTH: {
      LOGIN: '/api/auth/login'
    }
  }
};

export const buildApiUrl = (endpoint: string, params?: Record<string, any>) => {
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  return url;
};

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