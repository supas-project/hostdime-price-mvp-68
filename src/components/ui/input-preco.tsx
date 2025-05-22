
import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { formatCurrency, parseBRLToFloat } from "@/utils/number-formatter";

interface InputPrecoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
  onBlur?: (value: number) => void;
  className?: string;
}

export function InputPreco({
  value,
  onChange,
  label,
  className,
  placeholder = "R$ 0,00",
  disabled = false,
  onBlur,
  ...props
}: InputPrecoProps) {
  const [displayValue, setDisplayValue] = useState<string>("");

  // Inicializa e atualiza o valor formatado quando a prop value muda
  useEffect(() => {
    if (value !== undefined) {
      const numValue = typeof value === 'number' ? value : parseBRLToFloat(value);
      setDisplayValue(formatCurrency(numValue));
    }
  }, [value]);

  // Função para lidar com mudanças no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite que o usuário edite livremente
    setDisplayValue(e.target.value);
  };

  // Função para lidar com o blur (perda de foco)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    try {
      // Converte para número
      const numericValue = parseBRLToFloat(displayValue);
      
      // Formata para exibição
      setDisplayValue(formatCurrency(numericValue));
      
      // Chama o onChange com o valor numérico
      onChange(numericValue);
      
      // Se houver onBlur personalizado, chame-o
      if (onBlur) {
        onBlur(numericValue);
      }
      
      console.log(`[InputPreco] Value formatted: ${displayValue} -> ${formatCurrency(numericValue)} (${numericValue})`);
    } catch (error) {
      console.error("[InputPreco] Error formatting price:", error);
      // Em caso de erro, mantém o valor atual e notifica
      setDisplayValue(formatCurrency(0));
      onChange(0);
    }
  };

  return (
    <div className="flex flex-col space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Input
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        {...props}
      />
    </div>
  );
}
