
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Admin Users Function - Request:', req.method)
    
    // Verificar autorização
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ No authorization header')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se é admin
    const token = authHeader.replace('Bearer ', '')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const isServiceRole = token === serviceRoleKey

    let userEmail = null
    if (!isServiceRole) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      )

      const { data } = await supabaseClient.auth.getUser()
      userEmail = data?.user?.email
    }

    const isAuthorized = isServiceRole || userEmail === 'admin@hostdime.com.br'
    if (!isAuthorized) {
      console.log('🚫 Unauthorized:', { userEmail, isServiceRole })
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Access authorized:', { isServiceRole, userEmail })

    // Cliente admin
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

    // GET - Listar usuários
    if (req.method === 'GET') {
      console.log('📋 Listing users...')
      
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('❌ Error listing users:', listError)
        return new Response(
          JSON.stringify({ error: listError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Users listed successfully:', authUsers?.users?.length)

      return new Response(
        JSON.stringify({ users: authUsers.users }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Para POST, PUT, DELETE - ler body
    let requestData = {}
    try {
      const bodyText = await req.text()
      if (bodyText) {
        requestData = JSON.parse(bodyText)
        console.log('📥 Request data:', requestData)
      }
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Criar usuário
    if (req.method === 'POST') {
      console.log('➕ Creating user...')
      
      const { email, password, user_metadata } = requestData as any

      if (!email || !password) {
        console.error('⚠️ Missing email or password')
        return new Response(
          JSON.stringify({ error: 'Email and password required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: user_metadata || {}
      })

      if (createError) {
        console.error('❌ Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ User created:', newUser.user?.email)

      return new Response(
        JSON.stringify({ user: newUser, message: 'User created successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT - Atualizar usuário
    if (req.method === 'PUT') {
      console.log('✏️ Updating user...')
      
      const { userId, email, user_metadata } = requestData as any

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email, user_metadata: user_metadata || {} }
      )

      if (updateError) {
        console.error('❌ Error updating user:', updateError)
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ User updated:', updatedUser.user?.email)

      return new Response(
        JSON.stringify({ user: updatedUser, message: 'User updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE - Deletar usuário
    if (req.method === 'DELETE') {
      console.log('🗑️ Deleting user...')
      
      const { userId } = requestData as any

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (deleteError) {
        console.error('❌ Error deleting user:', deleteError)
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ User deleted:', userId)

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
    console.error('💥 Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
