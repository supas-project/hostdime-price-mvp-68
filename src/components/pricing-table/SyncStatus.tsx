
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

type SyncStatusType = 'synced' | 'pending' | 'error';

export function SyncStatus() {
  // Por enquanto, vamos mostrar como sincronizado
  // Futuramente pode ser conectado a um serviço real de status
  const status = 'synced' as SyncStatusType;

  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: CheckCircle,
          label: 'Sincronizado',
          variant: 'default' as const,
          className: 'text-green-600 border-green-600'
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Sincronizando',
          variant: 'outline' as const,
          className: 'text-yellow-600 border-yellow-600'
        };
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Erro na Sincronização',
          variant: 'destructive' as const,
          className: 'text-red-600 border-red-600'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Status Desconhecido',
          variant: 'outline' as const,
          className: 'text-gray-600 border-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
