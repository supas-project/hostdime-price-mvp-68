
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagSelector } from "../TagSelector";
import { Control } from "react-hook-form";
import { FormValues } from "../schemas/itemFormSchema";

interface ItemFormFieldsProps {
  control: Control<FormValues>;
}

export function ItemFormFields({ control }: ItemFormFieldsProps) {
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
              <Input placeholder="Subtipo do componente" {...field} />
            </FormControl>
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
                  console.log("Updated specs:", specLines);
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
                  console.log("Updated tags:", newTags);
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
