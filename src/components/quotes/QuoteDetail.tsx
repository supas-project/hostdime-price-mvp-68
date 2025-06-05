import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Quote, QuoteStatus } from '@/types/quote';
import { formatCurrency } from '@/utils/number-formatter';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  Mail,
  FileText,
  Download,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePermissions } from '@/hooks/usePermissions';

interface QuoteDetailProps {
  quote: Quote;
  onEdit?: () => void;
  onSendEmail?: () => void;
  onDownloadPDF?: () => void;
}

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

export function QuoteDetail({ quote, onEdit, onSendEmail, onDownloadPDF }: QuoteDetailProps) {
  const configuration = quote.configuration;
  const permissions = usePermissions();

  return (
    <div className="space-y-6">
      {/* Header da Cotação */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {quote.customer_name || 'Cotação sem nome'}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {quote.customer_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {quote.customer_email}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Criada em {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Válida até {format(new Date(quote.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
              </div>
            </div>
            <Badge className={statusColors[quote.status]}>
              {statusLabels[quote.status]}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2">
            {onEdit && quote.status === QuoteStatus.DRAFT && permissions.canEditQuotes && (
              <Button onClick={onEdit}>
                <FileText className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {onDownloadPDF && permissions.canDownloadPDF && (
              <Button variant="outline" onClick={onDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
            {onSendEmail && quote.status === QuoteStatus.DRAFT && permissions.canSendEmails && (
              <Button variant="outline" onClick={onSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Enviar por Email
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Data Center e Contrato */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Data Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{configuration.data_center?.name}</p>
            <p className="text-sm text-muted-foreground">
              {configuration.data_center?.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{configuration.contract?.name}</p>
            <p className="text-sm text-muted-foreground">
              Duração: {quote.contract_duration} meses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuração do Servidor */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Servidor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CPU */}
          {configuration.cpu && (
            <div>
              <h4 className="font-medium mb-2">Processador</h4>
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-medium">{configuration.cpu.name}</p>
                <p className="text-sm text-muted-foreground">{configuration.cpu.description}</p>
                <p className="text-sm font-medium mt-1">{formatCurrency(configuration.cpu.price)}</p>
              </div>
            </div>
          )}

          {/* Memória */}
          {configuration.memory && (
            <div>
              <h4 className="font-medium mb-2">Memória</h4>
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-medium">{configuration.memory.name}</p>
                <p className="text-sm text-muted-foreground">{configuration.memory.description}</p>
                <p className="text-sm font-medium mt-1">{formatCurrency(configuration.memory.price)}</p>
              </div>
            </div>
          )}

          {/* Storage Interno */}
          {configuration.storage_internal && configuration.storage_internal.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Armazenamento Interno</h4>
              <div className="space-y-2">
                {configuration.storage_internal.map((storage, index) => (
                  <div key={index} className="bg-muted p-3 rounded-lg">
                    <p className="font-medium">{storage.name}</p>
                    <p className="text-sm text-muted-foreground">{storage.description}</p>
                    <p className="text-sm font-medium mt-1">{formatCurrency(storage.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Externo */}
          {configuration.storage_external && configuration.storage_external.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Armazenamento Externo</h4>
              <div className="space-y-2">
                {configuration.storage_external.map((storage, index) => (
                  <div key={index} className="bg-muted p-3 rounded-lg">
                    <p className="font-medium">{storage.name}</p>
                    <p className="text-sm text-muted-foreground">{storage.description}</p>
                    <p className="text-sm font-medium mt-1">{formatCurrency(storage.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sistema Operacional */}
          {configuration.operating_system && (
            <div>
              <h4 className="font-medium mb-2">Sistema Operacional</h4>
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-medium">{configuration.operating_system.name}</p>
                <p className="text-sm text-muted-foreground">{configuration.operating_system.description}</p>
                <p className="text-sm font-medium mt-1">{formatCurrency(configuration.operating_system.price)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.discounts > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descontos:</span>
                <span>-{formatCurrency(quote.discounts)}</span>
              </div>
            )}
            {quote.taxes > 0 && (
              <div className="flex justify-between">
                <span>Impostos:</span>
                <span>{formatCurrency(quote.taxes)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(quote.total_price)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{quote.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
