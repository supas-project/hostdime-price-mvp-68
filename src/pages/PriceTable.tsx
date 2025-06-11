import { useRealtimePresence } from '@/contexts/RealtimePresenceContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UserCheck } from 'lucide-react';
import PriceTableContainer from "@/components/price-table/PriceTableContainer";

export default function PriceTable() {
  const { isLocked, lockedBy } = useRealtimePresence();

  return (
    <div>
      {isLocked && (
        <Alert variant="destructive" className="m-4">
          <UserCheck className="h-4 w-4" />
          <AlertTitle>Edição Bloqueada</AlertTitle>
          <AlertDescription>
            O usuário <strong>{lockedBy}</strong> já está editando esta tabela. Suas ações foram desabilitadas para evitar conflitos.
          </AlertDescription>
        </Alert>
      )}

      <PriceTableContainer disabled={isLocked} />
    </div>
  );
}
