
import { Navigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { UnifiedPriceTable } from '@/components/unified-table/UnifiedPriceTable';

export default function UnifiedTable() {
  const { isAuthenticated } = useUnifiedAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <UnifiedPriceTable />;
}
