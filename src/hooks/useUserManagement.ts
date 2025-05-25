
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  profile: {
    nome_completo: string;
    tipo: string;
  };
}

interface NewUserForm {
  email: string;
  password: string;
  nome_completo: string;
  tipo: string;
}

interface EditUserForm {
  email: string;
  nome_completo: string;
  tipo: string;
}

export function useUserManagement(user: User | null, session: Session | null) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.email === 'admin@hostdime.com.br';

  const callAdminFunction = async (userId?: string, options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: any } = {}) => {
    if (!session?.access_token) {
      throw new Error('No access token available');
    }

    console.log('Calling admin function with userId:', userId, 'method:', options.method || 'GET');

    const functionName = 'admin-users';
    
    const functionOptions: any = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      }
    };

    if (options.body) {
      functionOptions.body = JSON.stringify(options.body);
    }

    let functionUrl = functionName;
    if (userId && options.method !== 'GET') {
      functionUrl = `${functionName}/${userId}`;
    }

    console.log('Invoking function:', functionUrl, 'with options:', functionOptions);

    const response = await supabase.functions.invoke(functionName, functionOptions);

    console.log('Admin function response:', response);

    if (response.error) {
      console.error('Function invocation error:', response.error);
      throw new Error(response.error.message || 'Request failed');
    }

    return response.data;
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      setLoading(true);
      const data = await callAdminFunction();
      console.log('Users loaded:', data);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userForm: NewUserForm) => {
    try {
      console.log('Creating user:', userForm);
      setLoading(true);
      await callAdminFunction(undefined, {
        method: 'POST',
        body: userForm,
      });
      
      toast.success('Usuário criado com sucesso');
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Erro ao criar usuário', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, editForm: EditUserForm) => {
    try {
      console.log('Updating user:', userId, editForm);
      setLoading(true);
      
      const response = await fetch(`https://nglwjdpocxelvarqjgts.supabase.co/functions/v1/admin-users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Update failed:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('Update result:', result);
      
      toast.success('Usuário atualizado com sucesso');
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar usuário', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('Deleting user:', userId);
      setLoading(true);
      
      const response = await fetch(`https://nglwjdpocxelvarqjgts.supabase.co/functions/v1/admin-users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete failed:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('Delete result:', result);
      
      toast.success('Usuário removido com sucesso');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao remover usuário', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://ae28c5be-7e60-48d7-b1fb-bb8b1140a4c9.lovableproject.com/auth/reset-password`,
      });
      
      if (error) throw error;
      toast.success('E-mail de redefinição enviado', {
        description: `Link enviado para ${email}`
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Erro ao enviar e-mail de redefinição');
    }
  };

  useEffect(() => {
    if (isAdmin && session?.access_token) {
      console.log('Component mounted, loading users...');
      loadUsers();
    }
  }, [isAdmin, session?.access_token]);

  return {
    users,
    loading,
    isAdmin,
    createUser,
    updateUser,
    deleteUser,
    sendPasswordReset,
    loadUsers
  };
}

export type { UserProfile, NewUserForm, EditUserForm };
