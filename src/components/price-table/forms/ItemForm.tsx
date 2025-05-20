
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PriceItem } from "@/types/pricing";
import { useEffect } from "react";
import { ItemFormFields } from "./components/ItemFormFields";
import { useItemForm } from "./hooks/useItemForm";
import { FormValues } from "./schemas/itemFormSchema";

type ItemFormProps = {
  onSubmit: (values: FormValues, itemId?: string) => void;
  defaultType?: string;
  item?: PriceItem;
  isEditing?: boolean;
};

export function ItemForm({ onSubmit, defaultType, item, isEditing = false }: ItemFormProps) {
  const { form, isSubmitting, setIsSubmitting, isHardwareCategory } = useItemForm({
    defaultType,
    item,
    isEditing
  });
  
  // Log the item being edited for debugging
  useEffect(() => {
    if (isEditing && item) {
      console.log("Editing item:", item);
      console.log("Item specs:", item.specs);
      console.log("Item tags:", item.tags);
      console.log("Item capacity:", item.capacity);
      console.log("Item subtype:", item.subtype);
      console.log("Item metadata:", item.metadata);
    }
  }, [item, isEditing]);

  const handleSubmit = (values: FormValues) => {
    // Avoid multiple submissions
    if (isSubmitting) return;
    
    // Ensure specs is always an array
    if (!values.specs) {
      values.specs = [];
    }
    
    // Ensure tags is always an array
    if (!values.tags) {
      values.tags = [];
    }
    
    // Log values before submission for debugging
    console.log("Form values to submit:", values);
    
    // Auto-add Hardware tag if type is hardware category and doesn't have Hardware tag
    if (isHardwareCategory() && !values.tags.includes("Hardware")) {
      const shouldAddHardware = confirm(
        "Este item parece ser um componente de hardware, mas não tem a tag 'Hardware'. " +
        "Deseja adicionar a tag 'Hardware' automaticamente?"
      );
      
      if (shouldAddHardware) {
        values.tags.push("Hardware");
      }
    }
    
    // Special handling for disk items - ensure subtype and capacity are preserved
    if (values.type === 'disk' || values.type === 'nvme' || values.type === 'ssd' || values.type === 'hdd') {
      // Add metadata for disk items to ensure proper persistence
      values.metadata = {
        ...(values.metadata || {}),
        type: values.type,
        subtype: values.subtype,
        capacity: values.capacity
      };
      
      // Ensure disk-specific properties are set at the root level as well
      if (!values.capacity && values.subtype) {
        // Try to extract capacity from subtype if not specified
        const capacityMatch = values.subtype.match(/(\d+(?:\.\d+)?)\s*(?:GB|TB|G|T)/i);
        if (capacityMatch) {
          values.capacity = capacityMatch[0];
        }
      }
    }
    
    setIsSubmitting(true);
    // Pass item ID if in editing mode
    onSubmit(values, isEditing ? item?.id : undefined);
    
    // Reset state after a delay, if component is still mounted
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <ItemFormFields control={form.control} />
        
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting || isSubmitting}
          >
            {isEditing ? "Salvar Alterações" : "Adicionar Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
