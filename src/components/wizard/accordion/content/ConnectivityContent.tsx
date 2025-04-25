
import { ConnectivityOptions } from "@/components/connectivity-options";
import { ComponentOption } from "@/types/component";

interface ConnectivityContentProps {
  options: ComponentOption[];
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  onUpdateConnectivityItems: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
}

export function ConnectivityContent({ 
  options, 
  connectivityItems, 
  onUpdateConnectivityItems 
}: ConnectivityContentProps) {
  return (
    <ConnectivityOptions
      options={options}
      selectedItems={connectivityItems}
      onUpdateItems={onUpdateConnectivityItems}
    />
  );
}
