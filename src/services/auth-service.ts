// Simple auth service with working credentials
export const authService = {
  login: async (email: string, password: string) => {
    console.log('Tentativa de login:', email, password);
    
    // Credenciais válidas
    const validCredentials = [
      { email: 'admin@hostdime.com.br', password: 'admin123', isAdmin: true },
      { email: 'user@hostdime.com.br', password: 'user123', isAdmin: false },
      { email: 'teste@teste.com', password: '123456', isAdmin: false }
    ];
    
    const user = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );
    
    if (user) {
      console.log('Login bem-sucedido para:', email);
      return Promise.resolve({ 
        success: true,
        user: { 
          email: user.email, 
          isAdmin: user.isAdmin,
          name: user.isAdmin ? 'Administrador' : 'Usuário'
        },
        token: 'mock-jwt-token-' + Date.now()
      });
    } else {
      console.log('Credenciais inválidas para:', email);
      throw new Error('Credenciais inválidas');
    }
  },
  logout: async () => {
    console.log('Logout realizado');
    return Promise.resolve({ success: true });
  }
};