
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuoteManagement } from '@/hooks/useQuoteManagement';
import { Quote, QuoteStatus } from '@/types/quote';
import { formatCurrency } from '@/utils/number-formatter';
import { toast } from '@/hooks/use-toast';
import { 
  Eye, 
  Copy, 
  Download, 
  Mail, 
  Trash2, 
  Plus,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePermissions } from '@/hooks/usePermissions';

const statusColors = {
  [QuoteStatus.DRAFT]: 'bg-gray-500',
  [QuoteStatus.SENT]: 'bg-blue-500',
  [QuoteStatus.APPROVED]: 'bg-green-500',
  [QuoteStatus.EXPIRED]: 'bg-red-500',
  [QuoteStatus.CANCELLED]: 'bg-orange-500'
};

const statusLabels = {
  [QuoteStatus.DRAFT]: 'Rascunho',
  [QuoteStatus.SENT]: 'Enviada',
  [QuoteStatus.APPROVED]: 'Aprovada',
  [QuoteStatus.EXPIRED]: 'Expirada',
  [QuoteStatus.CANCELLED]: 'Cancelada'
};

interface QuotesListProps {
  onCreateNew?: () => void;
  onViewQuote?: (quote: Quote) => void;
}

export function QuotesList({ onCreateNew, onViewQuote }: QuotesListProps) {
  const { 
    quotes, 
    loading, 
    loadQuotes, 
    duplicateQuote, 
    deleteQuote 
  } = useQuoteManagement();

  const permissions = usePermissions();

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const handleDuplicate = async (quoteId: string) => {
    if (!permissions.canCreateQuotes) {
      toast.error("Você não tem permissão para duplicar cotações");
      return;
    }
    
    const newQuote = await duplicateQuote(quoteId);
    if (newQuote && onViewQuote) {
      onViewQuote(newQuote);
    }
  };

  const handleDelete = async (quoteId: string) => {
    if (!permissions.canDeleteQuotes) {
      toast.error("Você não tem permissão para excluir cotações");
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir esta cotação?')) {
      await deleteQuote(quoteId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Minhas Cotações</h2>
        {onCreateNew && permissions.canCreateQuotes && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Cotação
          </Button>
        )}
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma cotação encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Você ainda não criou nenhuma cotação. Comece criando sua primeira cotação.
            </p>
            {onCreateNew && permissions.canCreateQuotes && (
              <Button onClick={onCreateNew}>
                Criar primeira cotação
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {quote.customer_name || 'Cotação sem nome'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {quote.customer_email}
                    </p>
                  </div>
                  <Badge className={statusColors[quote.status]}>
                    {statusLabels[quote.status]}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(quote.total_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contrato</p>
                    <p className="text-sm font-medium">
                      {quote.contract_duration} meses
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="text-sm">
                      {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Validade</p>
                    <p className="text-sm">
                      {format(new Date(quote.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {quote.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm">{quote.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {onViewQuote && permissions.canViewQuotes && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewQuote(quote)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                  )}
                  
                  {permissions.canCreateQuotes && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDuplicate(quote.id)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicar
                    </Button>
                  )}
                  
                  {permissions.canDownloadPDF && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  )}
                  
                  {quote.status === QuoteStatus.DRAFT && (
                    <>
                      {permissions.canSendEmails && (
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" />
                          Enviar
                        </Button>
                      )}
                      
                      {permissions.canDeleteQuotes && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(quote.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
