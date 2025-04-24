
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Home() {
  const navigate = useNavigate();
  const [showRecent, setShowRecent] = useState(false);
  
  const recentQuotes = [
    {
      id: "q-001",
      name: "Servidor Web",
      date: "23/04/2025",
      price: 1450
    },
    {
      id: "q-002",
      name: "Servidor de Banco de Dados",
      date: "20/04/2025",
      price: 2780
    }
  ];

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center space-y-6 mb-16">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-primary">Host</span>Dime
          </h1>
          <p className="text-muted-foreground text-lg">
            Configure seu servidor dedicado em poucos passos
          </p>
        </div>

        <Button 
          size="lg" 
          className="group text-base"
          onClick={() => navigate("/configure")}
        >
          <Plus className="mr-2 h-5 w-5" />
          Nova Configuração
        </Button>
      </div>

      <div className="max-w-xl mx-auto">
        <Collapsible>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-xs">
              {recentQuotes.length} cotações recentes
            </Badge>
            
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowRecent(!showRecent)}
                className="flex items-center gap-2 text-sm"
              >
                {showRecent ? "Ocultar" : "Mostrar"} cotações
                <ChevronDown className={`h-4 w-4 transition-transform ${showRecent ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-3">
            {recentQuotes.map(quote => (
              <Card 
                key={quote.id}
                className="p-4 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/quote/${quote.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{quote.name}</h3>
                    <p className="text-sm text-muted-foreground">{quote.date}</p>
                  </div>
                  <p className="text-primary font-medium">
                    {quote.price.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>
              </Card>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
