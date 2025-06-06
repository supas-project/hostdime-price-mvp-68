
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`🚀 User Management Function - ${req.method} request received`)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ Missing authorization header')
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

    const { data: userData } = await supabaseClient.auth.getUser()
    const isAdmin = userData?.user?.email === 'admin@hostdime.com.br'
    
    if (!isAdmin) {
      console.log('🚫 Unauthorized access attempt')
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Admin access verified')

    // Handle GET - List users
    if (req.method === 'GET') {
      console.log('📋 Fetching users list')
      
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
      
      if (error) {
        console.error('❌ Error fetching users:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ Found ${users?.users?.length || 0} users`)
      return new Response(
        JSON.stringify({ users: users.users }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body for POST/PUT/DELETE
    let requestBody = {}
    const bodyText = await req.text()
    
    if (bodyText) {
      try {
        requestBody = JSON.parse(bodyText)
        console.log('📥 Parsed request body:', Object.keys(requestBody))
      } catch (e) {
        console.error('❌ Invalid JSON in request body')
        return new Response(
          JSON.stringify({ error: 'Invalid JSON format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Handle POST - Create user
    if (req.method === 'POST') {
      const { email, password, nome_completo, tipo } = requestBody as any
      
      console.log('➕ Creating user:', email)
      
      if (!email || !password) {
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

      console.log('✅ User created successfully')
      return new Response(
        JSON.stringify({ user: data.user, message: 'User created successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle PUT - Update user
    if (req.method === 'PUT') {
      const { userId, email, nome_completo, tipo } = requestBody as any
      
      console.log('✏️ Updating user:', userId)
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { 
          email, 
          user_metadata: { 
            nome_completo: nome_completo || '', 
            tipo: tipo || 'user' 
          } 
        }
      )

      if (error) {
        console.error('❌ Error updating user:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ User updated successfully')
      return new Response(
        JSON.stringify({ user: data.user, message: 'User updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle DELETE - Delete user
    if (req.method === 'DELETE') {
      const { userId } = requestBody as any
      
      console.log('🗑️ Deleting user:', userId)
      
      if (!userId) {
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
        JSON.stringify({ message: 'User deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
