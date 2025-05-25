
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/hooks/useUserManagement';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onDeleteUser: (userId: string) => Promise<void>;
  loading: boolean;
}

export function DeleteUserModal({ 
  isOpen, 
  onClose, 
  user, 
  onDeleteUser, 
  loading 
}: DeleteUserModalProps) {
  const handleDelete = async () => {
    if (!user) return;
    await onDeleteUser(user.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Remoção</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover o usuário <strong>{user?.email}</strong>?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
