
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Filter } from 'lucide-react';

interface FilterStatsProps {
  total: number;
  filtered: number;
  percentage: number;
  hasFilters: boolean;
}

export function FilterStats({ total, filtered, percentage, hasFilters }: FilterStatsProps) {
  if (!hasFilters) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Mostrando todos os {total} itens disponíveis</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Filtros aplicados: {filtered} de {total} itens
            </span>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {percentage}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
