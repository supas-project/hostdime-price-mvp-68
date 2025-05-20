
interface NoDiskFoundStateProps {
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
}

export function NoDiskFoundState({ selectedDiskType }: NoDiskFoundStateProps) {
  return (
    <div className="py-8 flex flex-col items-center justify-center text-center">
      <p className="text-muted-foreground">
        Nenhum disco {selectedDiskType?.toUpperCase()} encontrado. 
        Por favor, adicione discos na Tabela de Preços ou selecione outro tipo.
      </p>
    </div>
  );
}
