import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { NewUserForm, EditUserForm } from '@/types/userManagement';

export class UserManagementService {
  private static async callAdminFunction(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    session: Session,
    userId?: string,
    userData?: any
  ) {
    if (!session?.access_token) {
      throw new Error('No access token available');
    }

    console.log('Calling admin function with:', { method, userId, userData });

    try {
      if (method === 'GET') {
        // Para GET requests, não enviar body nem Content-Type
        const { data, error } = await supabase.functions.invoke('admin-users', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
          // Não enviar body nem Content-Type para GET
        });

        console.log('Admin function response (GET):', { data, error });

        if (error) {
          console.error('Function invocation error:', error);
          throw new Error(error.message || 'Request failed');
        }

        return data;
      } else {
        // Para POST, PUT, DELETE, enviar dados no body
        const requestBody = {
          method,
          ...(userId && { userId }),
          ...userData
        };

        console.log('Sending request body:', requestBody);

        const { data, error } = await supabase.functions.invoke('admin-users', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: requestBody
        });

        console.log('Admin function response:', { data, error });

        if (error) {
          console.error('Function invocation error:', error);
          throw new Error(error.message || 'Request failed');
        }

        return data;
      }
    } catch (err) {
      console.error('Call admin function error:', err);
      throw err;
    }
  }

  static async loadUsers(session: Session) {
    console.log('Loading users...');
    const data = await this.callAdminFunction('GET', session);
    console.log('Users loaded:', data);
    return data.users || [];
  }

  static async createUser(session: Session, userForm: NewUserForm) {
    console.log('Creating user:', userForm);
    await this.callAdminFunction('POST', session, undefined, {
      email: userForm.email,
      password: userForm.password,
      user_metadata: { 
        nome_completo: userForm.nome_completo, 
        tipo: userForm.tipo 
      }
    });
  }

  static async updateUser(session: Session, userId: string, editForm: EditUserForm) {
    console.log('Updating user:', userId, editForm);
    await this.callAdminFunction('PUT', session, userId, {
      email: editForm.email,
      user_metadata: {
        nome_completo: editForm.nome_completo,
        tipo: editForm.tipo
      }
    });
  }

  static async deleteUser(session: Session, userId: string) {
    console.log('Deleting user:', userId);
    await this.callAdminFunction('DELETE', session, userId);
  }

  static async sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
  }
}
