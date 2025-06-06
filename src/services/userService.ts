
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { UserProfile, CreateUserData, UpdateUserData } from '@/types/user';

export class UserService {
  static async listUsers(session: Session): Promise<UserProfile[]> {
    console.log('📋 UserService: Listing users');
    
    const { data, error } = await supabase.functions.invoke('user-management', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      console.error('❌ UserService: Error listing users:', error);
      throw new Error(error.message || 'Failed to load users');
    }

    console.log('✅ UserService: Users loaded:', data?.users?.length || 0);
    return data?.users || [];
  }

  static async createUser(session: Session, userData: CreateUserData): Promise<void> {
    console.log('➕ UserService: Creating user:', userData.email);
    
    const { error } = await supabase.functions.invoke('user-management', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: userData
    });

    if (error) {
      console.error('❌ UserService: Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }

    console.log('✅ UserService: User created successfully');
  }

  static async updateUser(session: Session, userId: string, userData: UpdateUserData): Promise<void> {
    console.log('✏️ UserService: Updating user:', userId);
    
    const { error } = await supabase.functions.invoke('user-management', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: { userId, ...userData }
    });

    if (error) {
      console.error('❌ UserService: Error updating user:', error);
      throw new Error(error.message || 'Failed to update user');
    }

    console.log('✅ UserService: User updated successfully');
  }

  static async deleteUser(session: Session, userId: string): Promise<void> {
    console.log('🗑️ UserService: Deleting user:', userId);
    
    const { error } = await supabase.functions.invoke('user-management', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: { userId }
    });

    if (error) {
      console.error('❌ UserService: Error deleting user:', error);
      throw new Error(error.message || 'Failed to delete user');
    }

    console.log('✅ UserService: User deleted successfully');
  }

  static async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
  }
}
