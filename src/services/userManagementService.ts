
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { NewUserForm, EditUserForm } from '@/types/userManagement';

export class UserManagementService {
  
  static async loadUsers(session: Session) {
    console.log('Loading users...');
    
    const { data, error } = await supabase.functions.invoke('admin-users', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      console.error('Error loading users:', error);
      throw new Error(error.message || 'Failed to load users');
    }

    console.log('Users loaded successfully:', data?.users?.length);
    return data?.users || [];
  }

  static async createUser(session: Session, userForm: NewUserForm) {
    console.log('Creating user:', userForm.email);
    
    const { data, error } = await supabase.functions.invoke('admin-users', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: {
        email: userForm.email,
        password: userForm.password,
        user_metadata: { 
          nome_completo: userForm.nome_completo, 
          tipo: userForm.tipo 
        }
      }
    });

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }

    console.log('User created successfully');
    return data;
  }

  static async updateUser(session: Session, userId: string, editForm: EditUserForm) {
    console.log('Updating user:', userId);
    
    const { data, error } = await supabase.functions.invoke('admin-users', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: {
        userId,
        email: editForm.email,
        user_metadata: {
          nome_completo: editForm.nome_completo,
          tipo: editForm.tipo
        }
      }
    });

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(error.message || 'Failed to update user');
    }

    console.log('User updated successfully');
    return data;
  }

  static async deleteUser(session: Session, userId: string) {
    console.log('Deleting user:', userId);
    
    const { data, error } = await supabase.functions.invoke('admin-users', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: { userId }
    });

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error(error.message || 'Failed to delete user');
    }

    console.log('User deleted successfully');
    return data;
  }

  static async sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
  }
}
