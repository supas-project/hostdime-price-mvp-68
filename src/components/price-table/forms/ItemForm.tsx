
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

const itemFormSchema = z.object({
  name: z.string().min(3, { message: "Nome do item deve ter pelo menos 3 caracteres" }),
  description: z.string().min(3, { message: "Descrição deve ter pelo menos 3 caracteres" }),
  price: z.coerce.number().min(0, { message: "Preço deve ser maior ou igual a zero" }),
  type: z.string().min(1, { message: "Tipo é obrigatório" }),
  subtype: z.string().optional(),
  specs: z.string().optional().transform(val => val ? val.split('\n').filter(Boolean) : []),
});

type ItemFormProps = {
  onSubmit: (values: z.infer<typeof itemFormSchema>) => void;
  defaultType?: string;
};

export function ItemForm({ onSubmit, defaultType }: ItemFormProps) {
  const form = useForm<z.infer<typeof itemFormSchema>>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      type: defaultType || "",
      subtype: "",
      specs: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                  {...field} 
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
          <Button type="submit">Adicionar Item</Button>
        </div>
      </form>
    </Form>
  );
}
