
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Admin Users Function - Request received:', req.method, req.url)
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the token is the service role key
    const token = authHeader.replace('Bearer ', '')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (token !== serviceRoleKey) {
      console.error('🚫 Invalid or missing service role token')
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Service role token validated successfully')

    // Create Supabase client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('✅ Supabase admin client created')

    // Handle GET requests separately (no body)
    if (req.method === 'GET') {
      console.log('📋 Fetching users list...')
      // List all users
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('❌ Error listing users:', listError)
        throw listError
      }

      console.log('👥 Auth users fetched:', authUsers?.users?.length)

      // Get profiles for additional user data
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')

      console.log('📝 Profiles fetched:', profiles?.length)

      const usersWithProfiles = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id)
        return {
          ...user,
          profile: profile || { 
            nome_completo: user.user_metadata?.nome_completo || '', 
            tipo: user.user_metadata?.tipo || 'user' 
          }
        }
      })

      return new Response(
        JSON.stringify({ users: usersWithProfiles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body for non-GET requests
    let body;
    
    try {
      body = await req.json()
      console.log('🚀 RECEBIDO NA FUNÇÃO:', JSON.stringify(body))
      console.log('🔍 Body keys:', Object.keys(body))
      console.log('🔢 Body object size:', Object.keys(body).length)
    } catch (parseError) {
      console.error('❌ FALHA NO PARSE:', parseError.message)
      return new Response(
        JSON.stringify({ error: 'Erro ao parsear JSON' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const method = body.method || req.method
    const userId = body.userId

    console.log('⚙️ Processing request:', { method, userId, hasRequestData: !!body })

    switch (method) {
      case 'POST':
        console.log('➕ Creating new user...')
        
        const { email, password, user_metadata } = body

        if (!email || !password) {
          console.error('⚠️ Missing required fields:', { email: !!email, password: !!password })
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('📝 Creating user with data:', { email, user_metadata })

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: user_metadata || {}
        })

        if (createError) {
          console.error('❌ Error creating user:', createError)
          return new Response(
            JSON.stringify({ error: createError.message }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('✅ User created successfully:', newUser.user?.email)

        return new Response(
          JSON.stringify({ user: newUser, message: 'Usuário criado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        console.log('✏️ Updating user:', userId)
        
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required for update operation' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        const { email: newEmail, user_metadata: updateMetadata } = body

        console.log('📝 Updating user with data:', { email: newEmail, user_metadata: updateMetadata })

        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            email: newEmail,
            user_metadata: updateMetadata || {}
          }
        )

        if (updateError) {
          console.error('❌ Error updating user:', updateError)
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('✅ User updated successfully:', updatedUser.user?.email)

        return new Response(
          JSON.stringify({ user: updatedUser, message: 'Usuário atualizado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        console.log('🗑️ Deleting user:', userId)
        
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required for delete operation' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) {
          console.error('❌ Error deleting user:', deleteError)
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('✅ User deleted successfully:', userId)

        return new Response(
          JSON.stringify({ message: 'Usuário removido com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        console.error('❌ Unsupported method:', method)
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('💥 Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
