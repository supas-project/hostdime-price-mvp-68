
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagSelector } from "../TagSelector";
import { Control } from "react-hook-form";
import { FormValues } from "../schemas/itemFormSchema";
import { useEffect } from "react";

interface ItemFormFieldsProps {
  control: Control<FormValues>;
}

export function ItemFormFields({ control }: ItemFormFieldsProps) {
  // Debug log to check what values the form is being initialized with
  useEffect(() => {
    console.log("[ItemFormFields] Rendering with control values:", control._formValues);
  }, [control]);

  return (
    <>
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
                  // Ensure value is a valid number
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
        control={control}
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
        control={control}
        name="subtype"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subtipo (opcional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Subtipo do componente" 
                {...field} 
                onBlur={(e) => {
                  // Log the subtype value for debugging
                  console.log("[ItemFormFields] Subtype value on blur:", e.target.value);
                  field.onBlur();
                }}
              />
            </FormControl>
            <FormDescription>
              Importante para filtragem no configurador
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="capacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Capacidade (opcional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: 1TB, 500GB" 
                {...field} 
                onBlur={(e) => {
                  // Log the capacity value for debugging
                  console.log("[ItemFormFields] Capacity value on blur:", e.target.value);
                  field.onBlur();
                }}
              />
            </FormControl>
            <FormDescription>
              Especifique a capacidade para discos e memórias
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
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
                  console.log("[ItemFormFields] Updated specs:", specLines);
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
        control={control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <TagSelector 
                value={field.value || []} 
                onChange={(newTags) => {
                  field.onChange(newTags);
                  console.log("[ItemFormFields] Updated tags:", newTags);
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
    </>
  );
}
