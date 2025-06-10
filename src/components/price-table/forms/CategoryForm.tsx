
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

const categoryFormSchema = z.object({
  name: z.string().min(3, { message: "Nome da categoria deve ter pelo menos 3 caracteres" }),
});

type CategoryFormProps = {
  onSubmit: (values: z.infer<typeof categoryFormSchema>) => void;
};

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
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
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Memória, Processador, etc" {...field} />
              </FormControl>
              <FormDescription>
                Nome da categoria que aparecerá na tabela de preços
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit">Adicionar Categoria</Button>
        </div>
      </form>
    </Form>
  );
}
