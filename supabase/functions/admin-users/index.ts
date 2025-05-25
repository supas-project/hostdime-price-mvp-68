
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
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
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

    // Verify the requesting user is admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user || user.email !== 'admin@hostdime.com.br') {
      throw new Error('Unauthorized: Admin access required')
    }

    const { method } = req
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const userId = pathParts[pathParts.length - 1]

    switch (method) {
      case 'GET':
        // List all users
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError

        // Get profiles for additional user data
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('*')

        const usersWithProfiles = users.users.map(user => {
          const profile = profiles?.find(p => p.id === user.id)
          return {
            ...user,
            profile: profile || { nome_completo: '', tipo: 'user' }
          }
        })

        return new Response(
          JSON.stringify({ users: usersWithProfiles }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'POST':
        // Create new user
        const createData = await req.json()
        const { email, password, nome_completo, tipo } = createData

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: {
            nome_completo: nome_completo || '',
            tipo: tipo || 'user'
          }
        })

        if (createError) throw createError

        return new Response(
          JSON.stringify({ user: newUser, message: 'Usuário criado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        // Update user
        const updateData = await req.json()
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

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ user: updatedUser, message: 'Usuário atualizado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        // Delete user
        if (userId === user.id) {
          throw new Error('Não é possível remover sua própria conta')
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError

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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
