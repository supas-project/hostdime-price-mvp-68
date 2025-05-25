
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
    console.log('Admin Users Function - Request received:', req.method, req.url)
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      throw new Error('No authorization header')
    }

    // Create Supabase client for admin operations
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

    console.log('Supabase admin client created')

    // Verify the requesting user is admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    console.log('User verification:', { user: user?.email, error: userError })
    
    if (userError || !user || user.email !== 'admin@hostdime.com.br') {
      console.error('Unauthorized access attempt:', { userEmail: user?.email, error: userError })
      throw new Error('Unauthorized: Admin access required')
    }

    // Handle GET requests separately (no body)
    if (req.method === 'GET') {
      console.log('Fetching users list...')
      // List all users
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('Error listing users:', listError)
        throw listError
      }

      console.log('Auth users fetched:', authUsers?.users?.length)

      // Get profiles for additional user data
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')

      console.log('Profiles fetched:', profiles?.length)

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
    let requestData: any = {}
    
    try {
      const requestText = await req.text()
      console.log('Raw request body received:', requestText)
      console.log('Request body length:', requestText.length)
      
      if (!requestText || requestText.trim() === '') {
        console.error('Empty request body for non-GET request')
        return new Response(
          JSON.stringify({ error: 'Request body is required for this operation' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      requestData = JSON.parse(requestText)
      console.log('Successfully parsed request data:', JSON.stringify(requestData, null, 2))
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const method = requestData.method || req.method
    const userId = requestData.userId

    console.log('Processing request:', { method, userId, hasRequestData: !!requestData })

    switch (method) {
      case 'POST':
        console.log('Creating new user...')
        
        const { email, password, nome_completo, tipo } = requestData

        if (!email || !password) {
          console.error('Missing required fields:', { email: !!email, password: !!password })
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('Creating user with data:', { email, nome_completo, tipo })

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: {
            nome_completo: nome_completo || '',
            tipo: tipo || 'user'
          }
        })

        if (createError) {
          console.error('Error creating user:', createError)
          return new Response(
            JSON.stringify({ error: createError.message }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('User created successfully:', newUser.user?.email)

        return new Response(
          JSON.stringify({ user: newUser, message: 'Usuário criado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        console.log('Updating user:', userId)
        
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required for update operation' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        const { email: newEmail, nome_completo: newNome, tipo: newTipo } = requestData

        console.log('Updating user with data:', { email: newEmail, nome_completo: newNome, tipo: newTipo })

        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            email: newEmail,
            user_metadata: {
              nome_completo: newNome || '',
              tipo: newTipo || 'user'
            }
          }
        )

        if (updateError) {
          console.error('Error updating user:', updateError)
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('User updated successfully:', updatedUser.user?.email)

        return new Response(
          JSON.stringify({ user: updatedUser, message: 'Usuário atualizado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        console.log('Deleting user:', userId)
        
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required for delete operation' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        // Prevent admin from deleting their own account
        if (userId === user.id) {
          return new Response(
            JSON.stringify({ error: 'Não é possível remover sua própria conta' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) {
          console.error('Error deleting user:', deleteError)
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('User deleted successfully:', userId)

        return new Response(
          JSON.stringify({ message: 'Usuário removido com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        console.error('Unsupported method:', method)
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Function error:', error)
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
