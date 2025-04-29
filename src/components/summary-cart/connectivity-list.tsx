
import React from 'react';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";

interface ConnectivityListProps {
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
}

export function ConnectivityList({ connectivityItems }: ConnectivityListProps) {
  const items = Object.values(connectivityItems).filter(item => item && item.option);
  
  if (!items.length) return null;

  return (
    <>
      {items.map((item) => (
        <div key={item.option.id} className="flex justify-between items-center group animate-fade-in">
          <p className="text-sm font-medium">
            {item.quantity > 1 ? `${item.quantity}x ${item.option.name}` : item.option.name}
          </p>
          <p className="text-sm font-medium">{formatCurrency(item.option.price * item.quantity)}</p>
        </div>
      ))}
    </>
  );
}
