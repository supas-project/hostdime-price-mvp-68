
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

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

const FUNCTION_URL = 'https://nglwjdpocxelvarqjgts.supabase.co/functions/v1/user-admin';

export class UserAdminService {
  static async listUsers(session: Session): Promise<UserProfile[]> {
    console.log('📋 UserAdminService: Listing users');
    
    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
          'x-client-info': 'supabase-js-web/2.49.8'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ UserAdminService: HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ UserAdminService: Users loaded:', data?.users?.length || 0);
      return data?.users || [];
    } catch (error) {
      console.error('❌ UserAdminService: Error listing users:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to list users: ${error.message}`);
      }
      throw new Error('Failed to list users: Unknown error');
    }
  }

  static async createUser(session: Session, userData: CreateUserData): Promise<void> {
    console.log('➕ UserAdminService: Creating user:', userData.email);
    
    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
          'x-client-info': 'supabase-js-web/2.49.8'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ UserAdminService: HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅ UserAdminService: User created successfully');
    } catch (error) {
      console.error('❌ UserAdminService: Error creating user:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Failed to create user: Unknown error');
    }
  }

  static async updateUser(session: Session, userId: string, userData: UpdateUserData): Promise<void> {
    console.log('✏️ UserAdminService: Updating user:', userId);
    
    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
          'x-client-info': 'supabase-js-web/2.49.8'
        },
        body: JSON.stringify({ userId, ...userData })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ UserAdminService: HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅ UserAdminService: User updated successfully');
    } catch (error) {
      console.error('❌ UserAdminService: Error updating user:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      throw new Error('Failed to update user: Unknown error');
    }
  }

  static async deleteUser(session: Session, userId: string): Promise<void> {
    console.log('🗑️ UserAdminService: Deleting user:', userId);
    
    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
          'x-client-info': 'supabase-js-web/2.49.8'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ UserAdminService: HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅ UserAdminService: User deleted successfully');
    } catch (error) {
      console.error('❌ UserAdminService: Error deleting user:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
      throw new Error('Failed to delete user: Unknown error');
    }
  }

  static async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
  }
}
