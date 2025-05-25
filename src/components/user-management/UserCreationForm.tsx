
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { NewUserForm } from '@/types/userManagement';

interface UserCreationFormProps {
  onCreateUser: (userForm: NewUserForm) => Promise<void>;
  loading: boolean;
}

export function UserCreationForm({ onCreateUser, loading }: UserCreationFormProps) {
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    email: '',
    password: '',
    nome_completo: '',
    tipo: 'user'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateUser(newUserForm);
    setNewUserForm({ email: '', password: '', nome_completo: '', tipo: 'user' });
  };

  return (
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
  );
}
