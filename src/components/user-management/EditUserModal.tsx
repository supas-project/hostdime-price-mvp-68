
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, EditUserForm } from '@/types/userManagement';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateUser: (userId: string, editForm: EditUserForm) => Promise<void>;
  loading: boolean;
}

export function EditUserModal({ 
  isOpen, 
  onClose, 
  user, 
  onUpdateUser, 
  loading 
}: EditUserModalProps) {
  const [editForm, setEditForm] = useState<EditUserForm>({
    email: '',
    nome_completo: '',
    tipo: 'user'
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        email: user.email,
        nome_completo: user.profile?.nome_completo || '',
        tipo: user.profile?.tipo || 'user'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await onUpdateUser(user.id, editForm);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Altere os dados do usuário selecionado
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
