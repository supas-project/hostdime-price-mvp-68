
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { usePayBackCalculation } from "@/hooks/usePayBackCalculation";
import { useWizard } from "@/contexts/WizardContext";

interface CartFooterProps {
  totalPrice: number;
}

export function CartFooter({
  totalPrice
}: CartFooterProps) {
  const { toast } = useToast();
  const { selectedComponents, storageItems, connectivityItems, selectedContractOption } = useWizard();
  const { 
    calculateMonthlyCostWithPayBack, 
    isEligibleForPayBack 
  } = usePayBackCalculation();

  // Get contract duration from selected contract option
  const contractDuration = selectedContractOption?.id === "contrato-indeterminado" 
    ? "0" 
    : selectedContractOption?.id?.replace("contrato-", "") || "0";

  // Calculate total with PayBack applied
  const calculateTotalWithPayBack = () => {
    let total = 0;

    // Standard components
    Object.values(selectedComponents).forEach(component => {
      if (component && !['DataCenter', 'Contrato', 'Armazenamento'].includes(component.type)) {
        if (isEligibleForPayBack(component)) {
          total += calculateMonthlyCostWithPayBack(component, contractDuration);
        } else {
          total += component.price || 0;
        }
      }
    });

    // Internal storage (PayBack eligible)
    storageItems.internal.forEach(item => {
      if (item && item.price > 0) {
        const storageComponent = { ...item, type: 'Armazenamento Interno' };
        if (isEligibleForPayBack(storageComponent)) {
          total += calculateMonthlyCostWithPayBack(storageComponent, contractDuration);
        } else {
          total += item.price;
        }
      }
    });

    // External storage (not PayBack eligible)
    storageItems.external.forEach(item => {
      if (item && item.price > 0) {
        total += item.price;
      }
    });

    // Connectivity items (not PayBack eligible)
    Object.values(connectivityItems).forEach(({ option, quantity }) => {
      if (option && option.price) {
        total += option.price * quantity;
      }
    });

    return total;
  };

  const displayTotal = calculateTotalWithPayBack();

  console.log("[CartFooter] Total with PayBack applied:", displayTotal);

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
          {formatCurrency(displayTotal)}
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
