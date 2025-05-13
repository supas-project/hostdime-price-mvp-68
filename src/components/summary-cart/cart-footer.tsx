
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface CartFooterProps {
  totalPrice: number;
}

export function CartFooter({
  totalPrice
}: CartFooterProps) {
  const { toast } = useToast();

  const handleSave = () => {
    toast.default({
      title: "Configuração salva",
      description: "Sua configuração foi salva com sucesso."
    });
  };
  
  return (
    <div className="p-4 border-t border-border mt-auto sticky bottom-0 bg-card rounded-b-2xl">
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium">Total</span>
        <span className="font-bold text-primary text-lg">{formatCurrency(totalPrice)}</span>
      </div>
      
      <Button variant="ghost" className="w-full" onClick={handleSave}>
        <Save className="mr-2 h-4 w-4" /> Salvar Configuração
      </Button>
    </div>
  );
}
