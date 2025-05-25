
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
        // Para GET requests, usar supabase.functions.invoke
        const { data, error } = await supabase.functions.invoke('admin-users', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          }
        });

        console.log('Admin function response (GET):', { data, error });

        if (error) {
          console.error('Function invocation error:', error);
          throw new Error(error.message || 'Request failed');
        }

        return data;
      } else {
        // Para POST, PUT, DELETE, usar fetch com body JSON
        const requestBody = {
          method,
          ...(userId && { userId }),
          ...(userData && userData)
        };

        console.log('Sending request body:', requestBody);
        console.log('Sending request body (stringified):', JSON.stringify(requestBody, null, 2));

        // Usar fetch diretamente com URL completa
        const functionUrl = `https://nglwjdpocxelvarqjgts.supabase.co/functions/v1/admin-users`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbHdqZHBvY3hlbHZhcnFqZ3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTE3OTMsImV4cCI6MjA2MTQyNzc5M30.8xCetXorVi2SehrE_Tfgf-I_96o75alWXTMSHZLNh7s',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Function response status:', response.status);
        console.log('Function response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Function error response:', errorText);
          throw new Error(`Function failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Admin function response:', data);
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
    await this.callAdminFunction('POST', session, undefined, userForm);
  }

  static async updateUser(session: Session, userId: string, editForm: EditUserForm) {
    console.log('Updating user:', userId, editForm);
    await this.callAdminFunction('PUT', session, userId, editForm);
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
