
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  nome_completo?: string;
  tipo?: 'user' | 'admin';
}

interface UpdateUserRequest {
  userId: string;
  email?: string;
  nome_completo?: string;
  tipo?: 'user' | 'admin';
}

interface DeleteUserRequest {
  userId: string;
}

serve(async (req) => {
  console.log(`🚀 User Admin Function - ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid authorization header')
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: userData, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !userData?.user) {
      console.error('❌ Invalid token or user not found:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isAdmin = userData.user.email === 'admin@hostdime.com.br'
    
    if (!isAdmin) {
      console.log('🚫 Non-admin access attempt:', userData.user.email)
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Admin access verified:', userData.user.email)

    // Handle different HTTP methods
    const url = new URL(req.url)
    const path = url.pathname

    if (req.method === 'GET' && path.endsWith('/users')) {
      console.log('📋 Listing users...')
      
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
      
      if (error) {
        console.error('❌ Error listing users:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ Listed ${users?.users?.length || 0} users`)
      return new Response(
        JSON.stringify({ users: users.users }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body for POST/PUT/DELETE
    let body: any = {}
    if (req.method !== 'GET') {
      const contentType = req.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const bodyText = await req.text()
        console.log('📥 Received body:', bodyText)
        
        if (bodyText.trim()) {
          try {
            body = JSON.parse(bodyText)
            console.log('📦 Parsed body:', body)
          } catch (e) {
            console.error('❌ Invalid JSON in request body:', e)
            return new Response(
              JSON.stringify({ error: 'Invalid JSON format' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      }
    }

    if (req.method === 'POST' && path.endsWith('/users')) {
      const { email, password, nome_completo, tipo }: CreateUserRequest = body
      
      console.log('➕ Creating user:', { email, nome_completo, tipo })
      
      if (!email || !password) {
        console.error('❌ Missing required fields')
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { 
          nome_completo: nome_completo || '', 
          tipo: tipo || 'user' 
        }
      })

      if (error) {
        console.error('❌ Error creating user:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ User created successfully:', data.user?.email)
      return new Response(
        JSON.stringify({ success: true, user: data.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT' && path.includes('/users/')) {
      const { userId, email, nome_completo, tipo }: UpdateUserRequest = body
      
      console.log('✏️ Updating user:', { userId, email, nome_completo, tipo })
      
      if (!userId) {
        console.error('❌ Missing userId')
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData: any = {}
      if (email) updateData.email = email
      if (nome_completo !== undefined || tipo !== undefined) {
        updateData.user_metadata = { 
          nome_completo: nome_completo || '', 
          tipo: tipo || 'user' 
        }
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData)

      if (error) {
        console.error('❌ Error updating user:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ User updated successfully')
      return new Response(
        JSON.stringify({ success: true, user: data.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'DELETE' && path.includes('/users/')) {
      const { userId }: DeleteUserRequest = body
      
      console.log('🗑️ Deleting user:', userId)
      
      if (!userId) {
        console.error('❌ Missing userId')
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (error) {
        console.error('❌ Error deleting user:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ User deleted successfully')
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed or invalid path' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
