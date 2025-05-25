
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

    const { method } = req
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(segment => segment)
    const userId = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : null

    console.log('Processing request:', { method, userId, pathname: url.pathname })

    switch (method) {
      case 'GET':
        console.log('Fetching users list...')
        // List all users
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        console.log('Auth users response:', { 
          usersCount: authUsers?.users?.length, 
          error: listError,
          users: authUsers?.users?.map(u => ({ id: u.id, email: u.email }))
        })
        
        if (listError) {
          console.error('Error listing users:', listError)
          throw listError
        }

        // Get profiles for additional user data
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('*')

        console.log('Profiles response:', { 
          profilesCount: profiles?.length, 
          error: profilesError,
          profiles: profiles?.map(p => ({ id: p.id, email: p.email, nome_completo: p.nome_completo }))
        })

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

        console.log('Final users with profiles:', usersWithProfiles.length)

        return new Response(
          JSON.stringify({ users: usersWithProfiles }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'POST':
        console.log('Creating new user...')
        
        let createData
        try {
          const requestText = await req.text()
          console.log('Raw request body:', requestText)
          
          if (!requestText || requestText.trim() === '') {
            throw new Error('Empty request body')
          }
          
          createData = JSON.parse(requestText)
          console.log('Parsed create data:', createData)
        } catch (parseError) {
          console.error('Error parsing request body:', parseError)
          throw new Error('Invalid JSON in request body')
        }
        
        const { email, password, nome_completo, tipo } = createData

        if (!email || !password) {
          throw new Error('Email and password are required')
        }

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
          throw createError
        }

        console.log('User created successfully:', newUser.user?.email)

        return new Response(
          JSON.stringify({ user: newUser, message: 'Usuário criado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        console.log('Updating user:', userId)
        
        if (!userId) {
          throw new Error('User ID is required for update operation')
        }
        
        let updateData
        try {
          const requestText = await req.text()
          console.log('Raw update request body:', requestText)
          
          if (!requestText || requestText.trim() === '') {
            throw new Error('Empty request body')
          }
          
          updateData = JSON.parse(requestText)
          console.log('Parsed update data:', updateData)
        } catch (parseError) {
          console.error('Error parsing update request body:', parseError)
          throw new Error('Invalid JSON in request body')
        }
        
        const { email: newEmail, nome_completo: newNome, tipo: newTipo } = updateData

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
          throw updateError
        }

        console.log('User updated successfully:', updatedUser.user?.email)

        return new Response(
          JSON.stringify({ user: updatedUser, message: 'Usuário atualizado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        console.log('Deleting user:', userId)
        
        if (!userId) {
          throw new Error('User ID is required for delete operation')
        }
        
        // Delete user
        if (userId === user.id) {
          throw new Error('Não é possível remover sua própria conta')
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) {
          console.error('Error deleting user:', deleteError)
          throw deleteError
        }

        console.log('User deleted successfully:', userId)

        return new Response(
          JSON.stringify({ message: 'Usuário removido com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response('Method not allowed', { 
          status: 405, 
          headers: corsHeaders 
        })
    }
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
