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
import { PriceItem } from "@/types/pricing";
import { useEffect, useState } from "react";
import { debounce } from "@/lib/utils";

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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price || 0,
      type: item?.type || defaultType || "",
      subtype: item?.subtype || "",
      specs: item?.specs || [],
    },
    mode: "onBlur", // Validar ao perder o foco
  });

  // Atualiza o formulário quando o item muda (edição)
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description,
        price: item.price,
        type: item.type,
        subtype: item.subtype || "",
        specs: item.specs || [],
      });
    }
  }, [item, form]);

  const handleSubmit = (values: FormValues) => {
    // Evita múltiplas submissões
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    // Passa o item ID se estamos em modo de edição
    onSubmit(values, isEditing ? item?.id : undefined);
    
    // Reset o estado após um tempo, caso o componente ainda esteja montado
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
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => {
                    // Garantir que o valor seja um número válido
                    const value = e.target.value;
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) {
                      e.target.setCustomValidity("Preço deve ser um número positivo");
                    } else {
                      e.target.setCustomValidity("");
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
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
                  onChange={e => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Cada linha será um item da lista de especificações
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
