
import React, { useState } from 'react';
import { QuotesList } from '@/components/quotes/QuotesList';
import { QuoteDetail } from '@/components/quotes/QuoteDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote } from '@/types/quote';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuotesPage() {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const navigate = useNavigate();

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
  };

  const handleBackToList = () => {
    setSelectedQuote(null);
  };

  const handleCreateNew = () => {
    navigate('/configure');
  };

  const handleEditQuote = () => {
    if (selectedQuote) {
      // Navegar para o configurador com os dados da cotação
      navigate('/configure', { state: { editQuote: selectedQuote } });
    }
  };

  if (selectedQuote) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToList}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Lista
          </Button>
        </div>
        
        <QuoteDetail 
          quote={selectedQuote}
          onEdit={handleEditQuote}
          onSendEmail={() => {
            // TODO: Implementar envio de email
            console.log('Enviar email para:', selectedQuote.customer_email);
          }}
          onDownloadPDF={() => {
            // TODO: Implementar download de PDF
            console.log('Download PDF da cotação:', selectedQuote.id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <QuotesList 
        onCreateNew={handleCreateNew}
        onViewQuote={handleViewQuote}
      />
    </div>
  );
}
