
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

  const callAdminFunction = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', userId?: string, userData?: any) => {
    if (!session?.access_token) {
      throw new Error('No access token available');
    }

    console.log('Calling admin function with:', { method, userId, userData });

    // Prepare the request payload
    const payload: any = { method };
    if (userId) payload.userId = userId;
    if (userData) payload.data = userData;

    console.log('Function payload:', payload);

    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: payload,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('Admin function response:', { data, error });

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(error.message || 'Request failed');
      }

      return data;
    } catch (err) {
      console.error('Call admin function error:', err);
      throw err;
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      setLoading(true);
      const data = await callAdminFunction('GET');
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
      await callAdminFunction('POST', undefined, userForm);
      
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
      
      await callAdminFunction('PUT', userId, editForm);
      
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
      
      await callAdminFunction('DELETE', userId);
      
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
        redirectTo: `${window.location.origin}/auth/reset-password`,
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
