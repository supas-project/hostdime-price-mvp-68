
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowRight, Calendar, Settings, Server } from "lucide-react";

interface QuoteSummary {
  id: string;
  name: string;
  date: string;
  components: {
    cpu: string;
    memory: string;
    storage: string;
  };
  totalPrice: number;
}

export default function Home() {
  const navigate = useNavigate();
  
  // Mock recent quotes data
  const recentQuotes: QuoteSummary[] = [
    {
      id: "q-001",
      name: "Servidor Web",
      date: "23/04/2025",
      components: {
        cpu: "Intel Core i7",
        memory: "32GB DDR4",
        storage: "1TB SSD",
      },
      totalPrice: 1450
    },
    {
      id: "q-002",
      name: "Servidor de Banco de Dados",
      date: "20/04/2025",
      components: {
        cpu: "Intel Xeon",
        memory: "64GB DDR4",
        storage: "2TB NVMe",
      },
      totalPrice: 2780
    }
  ];

  const startNewConfiguration = () => {
    navigate("/configure");
  };

  const viewQuoteDetails = (quoteId: string) => {
    // In a real app, this would navigate to the quote detail or load it
    console.log(`View quote ${quoteId}`);
  };

  return (
    <div className="container py-12 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex flex-col items-center justify-center h-full p-8 md:p-16 bg-card rounded-2xl border border-border text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                <Server className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">HostDime Servidor Wizard</h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
                Configure seu servidor dedicado de forma simples e rápida com nossa ferramenta intuitiva.
              </p>
            </div>
            
            <Button size="lg" className="group font-medium text-base" onClick={startNewConfiguration}>
              <Plus className="mr-2 h-5 w-5" />
              Criar Nova Configuração
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <div className="flex items-center gap-4 mt-8">
              <Button variant="outline" size="sm">
                Ver Tabelas de Preço
              </Button>
              <Button variant="ghost" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Demonstração
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Últimas Cotações</h2>
            <Button variant="ghost" size="sm">Ver Todas</Button>
          </div>
          
          {recentQuotes.map(quote => (
            <Card key={quote.id} className="overflow-hidden animate-fade-in hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle>{quote.name}</CardTitle>
                <CardDescription className="flex justify-between">
                  <span>Criado em {quote.date}</span>
                  <span className="font-medium text-primary">
                    {quote.totalPrice.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>CPU: {quote.components.cpu}</li>
                  <li>Memória: {quote.components.memory}</li>
                  <li>Armazenamento: {quote.components.storage}</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => viewQuoteDetails(quote.id)}
                >
                  Abrir Cotação
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          <Card className="border-dashed border-border">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Settings className="h-10 w-10 text-muted-foreground/40 mb-4" />
              <p className="text-sm text-muted-foreground text-center mb-4">
                Configure seus servidores e encontre todas as suas cotações aqui
              </p>
              <Button variant="outline" size="sm" onClick={startNewConfiguration}>
                <Plus className="mr-1 h-3 w-3" />
                Nova Configuração
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
