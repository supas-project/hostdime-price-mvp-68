
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/UnifiedAuthContext';
import { UnifiedPriceTable } from '@/components/unified-table/UnifiedPriceTable';

export default function UnifiedTable() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <UnifiedPriceTable />;
}
