
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, UpdateUserData } from '@/types/user';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateUser: (userId: string, userData: UpdateUserData) => Promise<void>;
  loading: boolean;
}

export function EditUserDialog({ 
  isOpen, 
  onClose, 
  user, 
  onUpdateUser, 
  loading 
}: EditUserDialogProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    email: '',
    nome_completo: '',
    tipo: 'user'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        nome_completo: user.user_metadata?.nome_completo || '',
        tipo: user.user_metadata?.tipo || 'user'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    console.log('📝 Submitting edit user form');
    try {
      await onUpdateUser(user.id, formData);
      onClose();
    } catch (error) {
      console.error('❌ Edit form submission error:', error);
    }
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
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_nome">Nome Completo</Label>
              <Input
                id="edit_nome"
                value={formData.nome_completo}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_tipo">Tipo</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value: 'user' | 'admin') => setFormData(prev => ({ ...prev, tipo: value }))}
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
