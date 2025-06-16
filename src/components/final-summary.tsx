import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, RotateCcw, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface SelectedComponent {
  category: string;
  component: {
    id: number;
    name: string;
    price: number;
    description?: string;
  };
  quantity: number;
}

interface FinalSummaryProps {
  selectedComponents: SelectedComponent[];
  onRestart: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function FinalSummary({ selectedComponents, onRestart }: FinalSummaryProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const totalPrice = selectedComponents.reduce(
    (total, item) => total + (item.component.price * item.quantity),
    0
  );

  const totalItems = selectedComponents.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const groupedComponents = selectedComponents.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SelectedComponent[]>);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = () => {
    const config = {
      title: 'Configuração de Servidor HostDime',
      components: selectedComponents,
      total: totalPrice
    };
    
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success('Configuração copiada para a área de transferência!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          🎉 Configuração Finalizada!
        </h1>
        <p className="text-muted-foreground">
          Sua configuração de servidor está pronta. Confira os detalhes abaixo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resumo da Configuração</span>
                <Badge variant="secondary">
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedComponents).map(([category, items]) => (
                <div key={category} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold text-lg mb-3 text-primary">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-muted/50 rounded">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.component.name}</h4>
                          {item.component.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.component.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(item.component.price * item.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.component.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Mensal:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar PDF'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleShare}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>

              <Button 
                variant="outline"
                onClick={onRestart}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Nova Configuração
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>✅ Configuração revisada</p>
                <p>📧 Entre em contato conosco para finalizar</p>
                <p>📞 (11) 4766-4840</p>
                <p>✉️ vendas@hostdime.com.br</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
