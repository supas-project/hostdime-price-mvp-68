
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    nome_completo?: string;
    tipo?: 'user' | 'admin';
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  nome_completo: string;
  tipo: 'user' | 'admin';
}

export interface UpdateUserData {
  email: string;
  nome_completo: string;
  tipo: 'user' | 'admin';
}
