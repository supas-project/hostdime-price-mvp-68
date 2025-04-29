
import React from 'react';

interface CartHeaderProps {
  title?: string;
}

export function CartHeader({ title = "Resumo do Servidor" }: CartHeaderProps) {
  return (
    <div className="p-4 border-b border-border">
      <h3 className="font-medium">{title}</h3>
    </div>
  );
}
