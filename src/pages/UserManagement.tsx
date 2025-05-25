import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Users, UserPlus, Edit, Trash2, Key } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  profile: {
    nome_completo: string;
    tipo: string;
  };
}

export default function UserManagement() {
  const { user, session } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    nome_completo: '',
    tipo: 'user'
  });

  const [editForm, setEditForm] = useState({
    email: '',
    nome_completo: '',
    tipo: 'user'
  });

  // Check if current user is admin
  const isAdmin = user?.email === 'admin@hostdime.com.br';

  const callAdminFunction = async (endpoint: string, options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: string } = {}) => {
    if (!session?.access_token) {
      throw new Error('No access token available');
    }

    console.log('Calling admin function:', endpoint, options.method || 'GET');

    const response = await supabase.functions.invoke('admin-users', {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: options.body,
    });

    console.log('Admin function response:', response);

    if (response.error) {
      console.error('Function invocation error:', response.error);
      throw new Error(response.error.message || 'Request failed');
    }

    return response.data;
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      setLoading(true);
      const data = await callAdminFunction('');
      console.log('Users loaded:', data);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating user:', newUserForm);
      setLoading(true);
      await callAdminFunction('', {
        method: 'POST',
        body: JSON.stringify(newUserForm),
      });
      
      toast.success('Usuário criado com sucesso');
      setNewUserForm({ email: '', password: '', nome_completo: '', tipo: 'user' });
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Erro ao criar usuário', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      console.log('Updating user:', selectedUser.id, editForm);
      setLoading(true);
      await callAdminFunction(`/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      
      toast.success('Usuário atualizado com sucesso');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar usuário', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      console.log('Deleting user:', selectedUser.id);
      setLoading(true);
      await callAdminFunction(`/${selectedUser.id}`, {
        method: 'DELETE',
      });
      
      toast.success('Usuário removido com sucesso');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao remover usuário', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      toast.success('E-mail de redefinição enviado', {
        description: `Link enviado para ${email}`
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Erro ao enviar e-mail de redefinição');
    }
  };

  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      nome_completo: user.profile?.nome_completo || '',
      tipo: user.profile?.tipo || 'user'
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    if (isAdmin && session?.access_token) {
      console.log('Component mounted, loading users...');
      loadUsers();
    }
  }, [isAdmin, session?.access_token]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Esta área é exclusiva para administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          Gestão de Usuários
        </h1>
        <p className="text-muted-foreground">
          Gerencie usuários do sistema - apenas para administradores
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Listar/Editar Usuários</TabsTrigger>
          <TabsTrigger value="create">Cadastrar Usuário</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Cadastrar Novo Usuário
              </CardTitle>
              <CardDescription>
                Preencha os dados do novo usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="usuario@hostdime.com.br"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Senha do usuário"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nome_completo">Nome Completo</Label>
                    <Input
                      id="nome_completo"
                      value={newUserForm.nome_completo}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, nome_completo: e.target.value }))}
                      placeholder="Nome completo do usuário"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Usuário</Label>
                    <Select 
                      value={newUserForm.tipo} 
                      onValueChange={(value) => setNewUserForm(prev => ({ ...prev, tipo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>
                Lista de todos os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.profile?.nome_completo || 'Não informado'}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.profile?.tipo === 'admin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.profile?.tipo === 'admin' ? 'Administrador' : 'Usuário'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendPasswordReset(user.email)}
                                >
                                  <Key className="w-4 h-4" />
                                </Button>
                                {user.email !== 'admin@hostdime.com.br' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteModal(user)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere os dados do usuário selecionado
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={updateUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_email">E-mail</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_nome">Nome Completo</Label>
                <Input
                  id="edit_nome"
                  value={editForm.nome_completo}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nome_completo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_tipo">Tipo</Label>
                <Select 
                  value={editForm.tipo} 
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o usuário <strong>{selectedUser?.email}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteUser} disabled={loading}>
              {loading ? 'Removendo...' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
