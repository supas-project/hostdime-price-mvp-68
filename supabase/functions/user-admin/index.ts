
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface UserUpdateRequest {
  userId?: string;
  email?: string;
  nome_completo?: string;
  tipo?: 'user' | 'admin';
  password?: string;
}

serve(async (req) => {
  console.log(`🚀 User Admin Function - ${req.method} ${req.url}`)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('📋 Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create clients
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify user is admin
    const { data: userData, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !userData?.user) {
      console.error('❌ Invalid user token:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const isAdmin = userData.user.email === 'admin@hostdime.com.br'
    
    if (!isAdmin) {
      console.log('🚫 Unauthorized access attempt from:', userData.user.email)
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Admin access verified for:', userData.user.email)

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET': {
        console.log('📋 Fetching users list')
        
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
        
        if (error) {
          console.error('❌ Error fetching users:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log(`✅ Found ${users?.users?.length || 0} users`)
        return new Response(
          JSON.stringify({ users: users.users }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'POST': {
        const body: UserUpdateRequest = await req.json()
        const { email, password, nome_completo, tipo } = body
        
        console.log('➕ Creating user:', email)
        
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
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
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('✅ User created successfully:', email)
        return new Response(
          JSON.stringify({ user: data.user, message: 'User created successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const body: UserUpdateRequest = await req.json()
        const { userId, email, nome_completo, tipo } = body
        
        console.log('✏️ Updating user:', userId)
        
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
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
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('✅ User updated successfully:', userId)
        return new Response(
          JSON.stringify({ user: data.user, message: 'User updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'DELETE': {
        const body: UserUpdateRequest = await req.json()
        const { userId } = body
        
        console.log('🗑️ Deleting user:', userId)
        
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
        
        if (error) {
          console.error('❌ Error deleting user:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('✅ User deleted successfully:', userId)
        return new Response(
          JSON.stringify({ message: 'User deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
