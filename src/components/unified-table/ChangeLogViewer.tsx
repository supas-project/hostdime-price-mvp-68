
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChangeLog } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChangeLogViewerProps {
  changeLog: ChangeLog[];
}

export function ChangeLogViewer({ changeLog }: ChangeLogViewerProps) {
  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOperationText = (operation: string) => {
    switch (operation) {
      case 'INSERT': return 'Criado';
      case 'UPDATE': return 'Atualizado';
      case 'DELETE': return 'Excluído';
      default: return operation;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log de Alterações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {changeLog.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma alteração registrada</p>
          ) : (
            changeLog.map((log) => (
              <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getOperationColor(log.operation)}>
                      {getOperationText(log.operation)}
                    </Badge>
                    <span className="font-medium">{log.table_name}</span>
                    <span className="text-sm text-gray-500">
                      há {formatDistanceToNow(new Date(log.changed_at), { locale: ptBR })}
                    </span>
                  </div>
                  
                  {log.operation === 'UPDATE' && log.old_values && log.new_values && (
                    <div className="text-sm space-y-1">
                      {Object.keys(log.new_values).filter(key => 
                        log.old_values![key] !== log.new_values![key]
                      ).map(key => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium">{key}:</span>
                          <span className="text-red-600 line-through">{String(log.old_values![key])}</span>
                          <span className="text-green-600">{String(log.new_values![key])}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {log.operation === 'INSERT' && log.new_values && (
                    <div className="text-sm">
                      <span className="font-medium">Nome:</span>{' '}
                      <span className="text-green-600">{log.new_values.name}</span>
                    </div>
                  )}
                  
                  {log.operation === 'DELETE' && log.old_values && (
                    <div className="text-sm">
                      <span className="font-medium">Nome:</span>{' '}
                      <span className="text-red-600">{log.old_values.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  v{log.version_number}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
