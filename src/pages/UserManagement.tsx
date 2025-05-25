
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Users } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserCreationForm } from '@/components/user-management/UserCreationForm';
import { UsersList } from '@/components/user-management/UsersList';
import { EditUserModal } from '@/components/user-management/EditUserModal';
import { DeleteUserModal } from '@/components/user-management/DeleteUserModal';
import { UserProfile } from '@/hooks/useUserManagement';

export default function UserManagement() {
  const { user, session } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const {
    users,
    loading,
    isAdmin,
    createUser,
    updateUser,
    deleteUser,
    sendPasswordReset
  } = useUserManagement(user, session);

  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
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
          <UserCreationForm onCreateUser={createUser} loading={loading} />
        </TabsContent>

        <TabsContent value="list">
          <UsersList
            users={users}
            loading={loading}
            onEditUser={openEditModal}
            onDeleteUser={openDeleteModal}
            onSendPasswordReset={sendPasswordReset}
          />
        </TabsContent>
      </Tabs>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        user={selectedUser}
        onUpdateUser={updateUser}
        loading={loading}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        user={selectedUser}
        onDeleteUser={deleteUser}
        loading={loading}
      />
    </div>
  );
}
