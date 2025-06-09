
import React from 'react';
import { SystemComponentsManager } from '@/components/system-components/SystemComponentsManager';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemComponents() {
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@hostdime.com.br';

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
      <SystemComponentsManager />
    </div>
  );
}
