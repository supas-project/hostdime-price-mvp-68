
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Users } from 'lucide-react';
import { useUserAdmin } from '@/hooks/useUserAdmin';
import { CreateUserForm } from '@/components/user-admin/CreateUserForm';
import { UsersTable } from '@/components/user-admin/UsersTable';
import { EditUserDialog } from '@/components/user-admin/EditUserDialog';
import { DeleteUserDialog } from '@/components/user-admin/DeleteUserDialog';
import { UserProfile } from '@/services/userAdminService';

export default function UserAdministration() {
  const { user, session } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const {
    users,
    loading,
    isAdmin,
    createUser,
    updateUser,
    deleteUser,
    sendPasswordReset
  } = useUserAdmin(user, session);

  const openEditDialog = (user: UserProfile) => {
    console.log('✏️ Opening edit dialog for user:', user.email);
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserProfile) => {
    console.log('🗑️ Opening delete dialog for user:', user.email);
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

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
          Administração de Usuários
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
          <CreateUserForm onCreateUser={createUser} loading={loading} />
        </TabsContent>

        <TabsContent value="list">
          <UsersTable
            users={users}
            loading={loading}
            onEditUser={openEditDialog}
            onDeleteUser={openDeleteDialog}
            onSendPasswordReset={sendPasswordReset}
          />
        </TabsContent>
      </Tabs>

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={closeEditDialog}
        user={selectedUser}
        onUpdateUser={updateUser}
        loading={loading}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        user={selectedUser}
        onDeleteUser={deleteUser}
        loading={loading}
      />
    </div>
  );
}
