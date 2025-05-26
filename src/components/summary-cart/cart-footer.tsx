
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CartFooterProps {
  totalPrice: number;
}

export function CartFooter({
  totalPrice
}: CartFooterProps) {
  const { toast } = useToast();

  const handleSave = () => {
    toast.success("Configuração salva", {
      description: "Sua configuração foi salva com sucesso."
    });
  };
  
  return (
    <div className={cn(
      "p-6 border-t-2 border-[#f58220]/20 mt-auto sticky bottom-0",
      "bg-gradient-to-r from-card to-card/95 backdrop-blur-sm rounded-b-2xl",
      "shadow-lg shadow-black/20"
    )}>
      <div className={cn(
        "flex justify-between items-center mb-6 p-4 rounded-xl",
        "bg-[#f58220]/10 border border-[#f58220]/30 shadow-md",
        "transition-all duration-300 hover:shadow-lg hover:shadow-[#f58220]/20"
      )}>
        <span className="font-semibold text-lg">Total Mensal</span>
        <span className={cn(
          "font-bold text-2xl text-[#f58220] transition-all duration-300",
          "hover:scale-105 drop-shadow-sm"
        )}>
          {formatCurrency(totalPrice)}
        </span>
      </div>
      
      <Button 
        variant="default" 
        className={cn(
          "w-full h-12 text-base font-semibold",
          "bg-[#f58220] hover:bg-[#e55a00] shadow-lg hover:shadow-[#f58220]/40",
          "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        )}
        onClick={handleSave}
      >
        <Save className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
        Salvar Configuração
      </Button>
    </div>
  );
}
