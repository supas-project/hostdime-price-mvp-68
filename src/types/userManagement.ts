
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    nome_completo?: string;
    tipo?: string;
  };
}

export interface NewUserForm {
  email: string;
  password: string;
  nome_completo: string;
  tipo: string;
}

export interface EditUserForm {
  email: string;
  nome_completo: string;
  tipo: string;
}
