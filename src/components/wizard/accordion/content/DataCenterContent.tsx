
import { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { findMatchingComponent } from "@/utils/component-matching";
import { toast } from "sonner";

interface DataCenterContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function DataCenterContent({
  options,
  selectedOption,
  onSelectOption,
}: DataCenterContentProps) {
  const [localSelectedId, setLocalSelectedId] = useState<string>(
    selectedOption?.id || ""
  );
  
  // Synchronize local state with props when selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      // Try to find a matching component in case the selectedOption came from elsewhere
      const matchingComponent = findMatchingComponent(selectedOption, options);
      if (matchingComponent) {
        setLocalSelectedId(matchingComponent.id);
      }
    }
  }, [selectedOption, options]);
  
  const handleChange = (value: string) => {
    try {
      setLocalSelectedId(value);
      const option = options.find(opt => opt.id === value);
      
      if (option) {
        // Call onSelectOption directly without setTimeout
        // The parent WizardContext will handle state properly now
        onSelectOption(option);
      }
    } catch (err) {
      console.error("Error selecting data center:", err);
      toast.error("Falha ao selecionar o data center. Por favor, tente novamente.");
    }
  };

  return (
    <div className="space-y-4 py-2">
      <RadioGroup
        value={localSelectedId}
        onValueChange={handleChange}
        className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3"
      >
        {options.map((option) => (
          <div key={option.id} className="relative">
            <RadioGroupItem
              value={option.id}
              id={option.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={option.id}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="mb-3 text-center">
                <p className="font-medium leading-none">{option.name}</p>
                <p className="text-sm text-muted-foreground pt-1">
                  {option.description}
                </p>
              </div>
              {option.metadata?.badge && (
                <div className="absolute -top-2 -right-2">
                  <span className="relative flex h-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                    {option.metadata.badge}
                  </span>
                </div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
