
import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { formatCurrency, parseBRLToFloat } from "@/utils/number-formatter";

// Modified the interface to avoid the type conflict with onChange
interface InputPrecoProps {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
  onBlur?: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  // Add other input props we need to pass through
  id?: string;
  name?: string;
  required?: boolean;
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
}: InputPrecoProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'onBlur'>) {
  const [displayValue, setDisplayValue] = useState<string>("");

  // Inicializa e atualiza o valor formatado quando a prop value muda
  useEffect(() => {
    if (value !== undefined) {
      // Garantir que estamos trabalhando com números primeiro
      let numValue: number;
      
      if (typeof value === 'number' && !isNaN(value)) {
        numValue = value;
      } else {
        numValue = parseBRLToFloat(String(value));
      }
      
      console.log(`[InputPreco] Formatting value ${value} (${typeof value}) to display, parsed: ${numValue}`);
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
      console.log(`[InputPreco] Handling blur with value: ${displayValue}`);
      
      // Converte para número usando a função aprimorada
      const numericValue = parseBRLToFloat(displayValue);
      console.log(`[InputPreco] Parsed value: ${numericValue}`);
      
      // Formata para exibição
      const formattedValue = formatCurrency(numericValue);
      console.log(`[InputPreco] Formatted back to: ${formattedValue}`);
      
      setDisplayValue(formattedValue);
      
      // Chama o onChange com o valor numérico
      onChange(numericValue);
      
      // Se houver onBlur personalizado, chame-o
      if (onBlur) {
        onBlur(numericValue);
      }
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
