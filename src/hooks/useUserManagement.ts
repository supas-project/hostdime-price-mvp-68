
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, NewUserForm, EditUserForm } from '@/types/userManagement';
import { UserManagementService } from '@/services/userManagementService';
import { toast } from '@/utils/toast-utils';

export function useUserManagement(user: User | null, session: Session | null) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.email === 'admin@hostdime.com.br';

  const loadUsers = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      const userData = await UserManagementService.loadUsers(session);
      setUsers(userData);
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
    if (!session) return;

    try {
      setLoading(true);
      await UserManagementService.createUser(session, userForm);
      toast.success('Usuário criado com sucesso');
      await loadUsers();
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
    if (!session) return;

    try {
      setLoading(true);
      await UserManagementService.updateUser(session, userId, editForm);
      toast.success('Usuário atualizado com sucesso');
      await loadUsers();
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
    if (!session) return;

    try {
      setLoading(true);
      await UserManagementService.deleteUser(session, userId);
      toast.success('Usuário removido com sucesso');
      await loadUsers();
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
      await UserManagementService.sendPasswordReset(email);
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
      console.log('Loading users on mount...');
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
