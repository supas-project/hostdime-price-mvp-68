
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PriceItem } from "@/types/pricing";
import { useEffect, useState } from "react";
import { itemFormSchema, FormValues } from "../schemas/itemFormSchema";

type UseItemFormProps = {
  defaultType?: string;
  item?: PriceItem;
  isEditing?: boolean;
};

export function useItemForm({ defaultType, item, isEditing = false }: UseItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Logging the item for debugging
  useEffect(() => {
    if (isEditing && item) {
      console.log("[useItemForm] Editing item:", item);
      console.log("[useItemForm] Item subtype:", item.subtype);
      console.log("[useItemForm] Item capacity:", item.capacity);
      console.log("[useItemForm] Item metadata:", item.metadata);
    }
  }, [item, isEditing]);
  
  // Derive initial tags from isHardware for backwards compatibility
  const getInitialTags = () => {
    if (!item) return [];
    
    // If item has tags property, use it
    if (item.tags && Array.isArray(item.tags)) {
      return item.tags;
    }
    
    // Otherwise, derive from isHardware for backwards compatibility
    return item.isHardware ? ["Hardware"] : [];
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price || 0,
      type: item?.type || defaultType || "",
      // CRITICAL: Ensure we get the subtype from multiple possible locations
      subtype: item?.subtype || (item?.metadata?.subtype as string) || "",
      specs: item?.specs || [],
      tags: getInitialTags(),
      // CRITICAL: Ensure we get the capacity from multiple possible locations
      capacity: item?.capacity || (item?.metadata?.capacity as string) || "",
    },
    mode: "onBlur", // Validate on blur
  });

  // Update form when item changes (editing mode)
  useEffect(() => {
    if (item) {
      console.log("[useItemForm] Resetting form with item:", item);
      
      // CRITICAL: For disk items, ensure capacity and subtype are extracted from all possible locations
      const capacity = item.capacity || (item.metadata?.capacity as string) || "";
      const subtype = item.subtype || (item.metadata?.subtype as string) || "";
      
      console.log("[useItemForm] Using capacity:", capacity);
      console.log("[useItemForm] Using subtype:", subtype);
      
      form.reset({
        name: item.name,
        description: item.description,
        price: item.price,
        type: item.type,
        // CRITICAL: Use extracted subtype
        subtype: subtype,
        specs: item.specs || [],
        tags: getInitialTags(),
        // CRITICAL: Use extracted capacity
        capacity: capacity,
      });
    }
  }, [item, form]);

  // Check if component is hardware based on type
  const isHardwareCategory = () => {
    const itemType = form.watch("type");
    return ["cpu", "memory", "disk", "storage", "chassis", "network"].includes(itemType.toLowerCase());
  };

  return { 
    form, 
    isSubmitting, 
    setIsSubmitting, 
    isHardwareCategory 
  };
}
