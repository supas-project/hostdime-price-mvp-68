import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PriceTable() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Tabela de Preços</h1>
          <CardDescription>
            Gerenciar componentes e preços do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Sistema de preços em desenvolvimento
            </p>
            <Button disabled>
              Funcionalidade em breve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}