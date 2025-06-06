
import { supabase } from '@/lib/supabaseClient';
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

export class UserAdminService {
  private static getBaseUrl(): string {
    return `https://nglwjdpocxelvarqjgts.supabase.co/functions/v1/user-admin`;
  }

  static async listUsers(session: Session): Promise<UserProfile[]> {
    console.log('📋 UserAdminService: Listing users');
    
    try {
      const response = await fetch(`${this.getBaseUrl()}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ UserAdminService: Users loaded:', data?.users?.length || 0);
      return data?.users || [];
    } catch (error) {
      console.error('❌ UserAdminService: Error listing users:', error);
      throw error;
    }
  }

  static async createUser(session: Session, userData: CreateUserData): Promise<void> {
    console.log('➕ UserAdminService: Creating user:', userData.email);
    
    try {
      const response = await fetch(`${this.getBaseUrl()}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log('✅ UserAdminService: User created successfully');
    } catch (error) {
      console.error('❌ UserAdminService: Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(session: Session, userId: string, userData: UpdateUserData): Promise<void> {
    console.log('✏️ UserAdminService: Updating user:', userId);
    
    try {
      const response = await fetch(`${this.getBaseUrl()}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ...userData })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log('✅ UserAdminService: User updated successfully');
    } catch (error) {
      console.error('❌ UserAdminService: Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(session: Session, userId: string): Promise<void> {
    console.log('🗑️ UserAdminService: Deleting user:', userId);
    
    try {
      const response = await fetch(`${this.getBaseUrl()}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log('✅ UserAdminService: User deleted successfully');
    } catch (error) {
      console.error('❌ UserAdminService: Error deleting user:', error);
      throw error;
    }
  }

  static async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
  }
}
