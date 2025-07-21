// Simple auth service mock
export const authService = {
  login: async (email: string, _password: string) => {
    console.log('Mock login:', email);
    return Promise.resolve({ user: { email, isAdmin: false } });
  },
  logout: async () => {
    console.log('Mock logout');
    return Promise.resolve();
  }
};