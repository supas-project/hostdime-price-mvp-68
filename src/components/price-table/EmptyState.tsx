
interface EmptyStateProps {
  isAdmin: boolean;
}

export function EmptyState({ isAdmin }: EmptyStateProps) {
  return (
    <div className="p-6 text-center animate-fade-in">
      <h3 className="text-lg font-medium mb-2">Nenhuma categoria cadastrada</h3>
      <p className="text-muted-foreground mb-4">
        {isAdmin 
          ? "Comece adicionando uma nova categoria ou importe dados existentes."
          : "Entre como administrador para gerenciar a tabela de preços."
        }
      </p>
    </div>
  );
}
