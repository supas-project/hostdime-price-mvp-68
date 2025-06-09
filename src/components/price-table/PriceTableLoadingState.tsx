
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/hooks/price-table/useLoadingStates';

interface PriceTableLoadingStateProps {
  loadingState: LoadingState;
  message: string;
}

export function PriceTableLoadingState({ loadingState, message }: PriceTableLoadingStateProps) {
  const getProgressValue = (state: LoadingState): number => {
    switch (state) {
      case 'initializing':
        return 20;
      case 'loading-data':
        return 40;
      case 'syncing':
        return 60;
      case 'processing':
        return 80;
      case 'refreshing':
        return 90;
      default:
        return 0;
    }
  };

  return (
    <div className="container py-6 md:py-8 animate-fade-in">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            
            <div className="space-y-2">
              <p className="text-foreground font-medium">{message}</p>
              <Progress value={getProgressValue(loadingState)} className="w-full" />
            </div>
            
            <p className="text-sm text-muted-foreground">
              Por favor, aguarde...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
