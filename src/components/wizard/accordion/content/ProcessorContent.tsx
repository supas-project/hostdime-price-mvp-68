
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useProcessor } from "@/hooks/useProcessor";
import { Skeleton } from "@/components/ui/skeleton";

interface ProcessorContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ProcessorContent({ selectedOption, onSelectOption }: ProcessorContentProps) {
  const { processorOptions, isLoading } = useProcessor();
  const [localOptions, setLocalOptions] = useState<ComponentOption[]>([]);

  useEffect(() => {
    if (processorOptions && processorOptions.length > 0) {
      console.log("[ProcessorContent] Processor options loaded:", processorOptions.length);
      setLocalOptions(processorOptions);
    }
  }, [processorOptions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (localOptions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Nenhuma opção de processador disponível</p>
      </div>
    );
  }

  return (
    <RadioGroup
      value={selectedOption?.id || ""}
      onValueChange={(value) => {
        const option = localOptions.find((opt) => opt.id === value);
        if (option) {
          onSelectOption(option);
        }
      }}
      className="space-y-3"
    >
      {localOptions.map((option) => (
        <div
          key={option.id}
          className={`flex items-center justify-between space-x-2 border rounded-lg p-4 transition-colors ${
            selectedOption?.id === option.id
              ? "bg-primary/5 border-primary"
              : "hover:bg-accent"
          }`}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value={option.id} id={option.id} />
            <div>
              <Label
                htmlFor={option.id}
                className="text-base font-medium cursor-pointer"
              >
                {option.name}
              </Label>
              <p className="text-sm text-muted-foreground max-w-md">
                {option.description}
              </p>
              {option.specs && option.specs.length > 0 && (
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  {option.specs.map((spec, index) => (
                    <li key={index}>{spec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="font-medium text-primary text-lg">
              {formatCurrency(option.price)}
            </span>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
}
