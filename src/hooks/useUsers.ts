
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, CreateUserData, UpdateUserData, UserService } from '@/services/userService';
import { toast } from 'sonner';

export function useUsers(user: User | null, session: Session | null) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.email === 'admin@hostdime.com.br';

  const loadUsers = async () => {
    if (!session || !isAdmin) return;
    
    try {
      setLoading(true);
      console.log('🔄 Loading users...');
      const userData = await UserService.listUsers(session);
      setUsers(userData);
      console.log('✅ Users loaded successfully');
    } catch (error) {
      console.error('❌ Error loading users:', error);
      toast.error('Erro ao carregar usuários', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData) => {
    if (!session || !isAdmin) return;

    try {
      setLoading(true);
      console.log('➕ Creating user...');
      await UserService.createUser(session, userData);
      toast.success('Usuário criado com sucesso');
      await loadUsers();
    } catch (error) {
      console.error('❌ Error creating user:', error);
      toast.error('Erro ao criar usuário', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: UpdateUserData) => {
    if (!session || !isAdmin) return;

    try {
      setLoading(true);
      console.log('✏️ Updating user...');
      await UserService.updateUser(session, userId, userData);
      toast.success('Usuário atualizado com sucesso');
      await loadUsers();
    } catch (error) {
      console.error('❌ Error updating user:', error);
      toast.error('Erro ao atualizar usuário', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!session || !isAdmin) return;

    try {
      setLoading(true);
      console.log('🗑️ Deleting user...');
      await UserService.deleteUser(session, userId);
      toast.success('Usuário removido com sucesso');
      await loadUsers();
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      toast.error('Erro ao remover usuário', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await UserService.sendPasswordReset(email);
      toast.success('E-mail de redefinição enviado', {
        description: `Link enviado para ${email}`
      });
    } catch (error) {
      console.error('❌ Error sending password reset:', error);
      toast.error('Erro ao enviar e-mail de redefinição');
    }
  };

  useEffect(() => {
    if (isAdmin && session?.access_token) {
      console.log('🚀 Initializing user management...');
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
