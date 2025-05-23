import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { TagSelector } from "./TagSelector";
import { PriceItem } from "@/types/pricing";
import { useEffect, useState } from "react";
import { InputPreco } from "@/components/ui/input-preco";
import { parseBRLToFloat } from "@/utils/number-formatter";

// Define o schema com tipagem explícita para specs como string[]
const itemFormSchema = z.object({
  name: z.string()
    .min(3, { message: "Nome do item deve ter pelo menos 3 caracteres" })
    .trim(),
  description: z.string()
    .min(3, { message: "Descrição deve ter pelo menos 3 caracteres" })
    .trim(),
  price: z.coerce.number()
    .min(0, { message: "Preço deve ser maior ou igual a zero" })
    .nonnegative({ message: "Preço não pode ser negativo" }),
  type: z.string()
    .min(1, { message: "Tipo é obrigatório" })
    .trim(),
  subtype: z.string().optional(),
  specs: z.preprocess(
    // Garantir que a entrada seja transformada em array
    (val): string[] => {
      if (typeof val === 'string') {
        return val.split('\n').filter(Boolean).map(line => line.trim());
      }
      if (Array.isArray(val)) {
        return val.filter(Boolean).map(line => 
          typeof line === 'string' ? line.trim() : String(line)
        );
      }
      return [];
    },
    z.array(z.string())
  ),
  tags: z.array(z.string()).default([]), // Added tags field
});

type FormValues = z.infer<typeof itemFormSchema>;

type ItemFormProps = {
  onSubmit: (values: FormValues, itemId?: string) => void;
  defaultType?: string;
  item?: PriceItem; // Added to support editing existing items
  isEditing?: boolean; // Flag to indicate if we're editing an item
};

export function ItemForm({ onSubmit, defaultType, item, isEditing = false }: ItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Log the item being edited for debugging
  useEffect(() => {
    if (isEditing && item) {
      console.log("[ItemForm] Editing item:", item);
      console.log("[ItemForm] Item specs:", item.specs);
      console.log("[ItemForm] Item tags:", item.tags);
      console.log("[ItemForm] Item price:", item.price, "Type:", typeof item.price);
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
      subtype: item?.subtype || "",
      specs: item?.specs || [],
      tags: getInitialTags(),
    },
    mode: "onBlur",
  });

  // CORREÇÃO: Garantir que o preço é inicializado corretamente
  useEffect(() => {
    if (item) {
      console.log("[ItemForm] Resetting form with item data:", item);
      console.log("[ItemForm] Price being set:", item.price, "Type:", typeof item.price);
      
      // Garantir que o preço é um número válido
      const price = typeof item.price === 'number' && !isNaN(item.price) 
        ? item.price 
        : parseBRLToFloat(item.price);
      
      form.reset({
        name: item.name || "",
        description: item.description || "",
        price: price,
        type: item.type || defaultType || "",
        subtype: item.subtype || "",
        specs: Array.isArray(item.specs) ? item.specs : [],
        tags: getInitialTags(),
      });
    }
  }, [item, form, defaultType]);

  // Check if component is hardware based on type
  const isHardwareCategory = () => {
    const itemType = form.watch("type");
    return ["cpu", "memory", "disk", "storage", "chassis", "network"].includes(itemType.toLowerCase());
  };

  const handleSubmit = (values: FormValues) => {
    // Evita múltiplas submissões
    if (isSubmitting) return;
    
    // CORREÇÃO: Garantir que o preço é um número válido
    const price = typeof values.price === 'number' && !isNaN(values.price) 
      ? values.price 
      : parseBRLToFloat(values.price);
    
    console.log(`[ItemForm] Original price: ${values.price} (${typeof values.price})`);
    console.log(`[ItemForm] Validated price: ${price} (${typeof price})`);
    
    // Update the price value
    values.price = price;
    
    // Ensure specs is always an array
    if (!values.specs) {
      values.specs = [];
    }
    
    // Ensure tags is always an array
    if (!values.tags) {
      values.tags = [];
    }
    
    // Log values before submission to debug
    console.log("[ItemForm] Form values to submit:", values);
    
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
    
    setIsSubmitting(true);
    // Passa o item ID se estamos em modo de edição
    onSubmit(values, isEditing ? item?.id : undefined);
    
    // Reset o estado após um tempo
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Descrição breve do item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço (R$)</FormLabel>
              <FormControl>
                <InputPreco
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    console.log("[ItemForm] Price changed to:", value, "Type:", typeof value);
                  }}
                  placeholder="R$ 0,00"
                  onBlur={(value) => {
                    field.onBlur();
                    console.log("[ItemForm] Price on blur:", value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Use o formato brasileiro (ex: 1.234,56)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Input placeholder="Tipo do componente" {...field} />
              </FormControl>
              <FormDescription>
                Usado para integração com o configurador
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtype"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtipo (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Subtipo do componente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especificações (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Adicione especificações técnicas (uma por linha)" 
                  className="min-h-[100px]"
                  value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                  onChange={e => {
                    const specLines = e.target.value.split('\n').filter(Boolean).map(line => line.trim());
                    field.onChange(specLines);
                    console.log("[ItemForm] Updated specs:", specLines);
                  }}
                />
              </FormControl>
              <FormDescription>
                Cada linha será um item da lista de especificações
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagSelector 
                  value={field.value || []} 
                  onChange={(newTags) => {
                    field.onChange(newTags);
                    console.log("[ItemForm] Updated tags:", newTags);
                  }}
                  defaultTags={["Hardware"]}  
                />
              </FormControl>
              <FormDescription>
                Adicione tags para categorizar o item (ex: Hardware, Licenciado)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
