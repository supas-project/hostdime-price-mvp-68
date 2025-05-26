
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { 
  Globe, 
  ShoppingCart, 
  Building2, 
  Database,
  Star,
  Users,
  Zap,
  Shield
} from "lucide-react";

export interface ServerTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  estimatedPrice: number;
  popular?: boolean;
  features: string[];
  components: {
    [key: string]: ComponentOption;
  };
  connectivityItems?: { [key: string]: { option: ComponentOption, quantity: number } };
  storageItems?: { internal: ComponentOption[], external: ComponentOption[] };
}

export const serverTemplates: ServerTemplate[] = [
  {
    id: "web-hosting",
    name: "Hospedagem Web",
    description: "Ideal para sites, blogs e aplicações web pequenas a médias",
    icon: Globe,
    category: "Web",
    estimatedPrice: 299,
    popular: true,
    features: [
      "Apache/Nginx otimizado",
      "SSL gratuito",
      "Backup diário",
      "Painel de controle"
    ],
    components: {
      "processador": {
        id: "cpu-basic-web",
        name: "Intel Xeon E-2234 4-Core",
        description: "Processador eficiente para web hosting",
        price: 150,
        type: "Processador",
        isHardware: true,
        specs: ["4 cores", "3.6 GHz base", "4.8 GHz turbo"]
      },
      "memoria": {
        id: "ram-16gb",
        name: "16GB DDR4 ECC",
        description: "Memória suficiente para múltiplos sites",
        price: 80,
        type: "Memoria",
        isHardware: true,
        specs: ["16GB total", "DDR4-2400", "ECC"]
      }
    }
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Configuração robusta para lojas virtuais e aplicações de alto tráfego",
    icon: ShoppingCart,
    category: "E-commerce", 
    estimatedPrice: 549,
    features: [
      "Magento/WooCommerce ready",
      "CDN integrado",
      "Certificado SSL EV",
      "Monitoramento 24/7"
    ],
    components: {
      "processador": {
        id: "cpu-ecommerce",
        name: "Intel Xeon E-2288G 8-Core",
        description: "Processador de alta performance para e-commerce",
        price: 280,
        type: "Processador", 
        isHardware: true,
        specs: ["8 cores", "3.7 GHz base", "5.0 GHz turbo"]
      },
      "memoria": {
        id: "ram-32gb",
        name: "32GB DDR4 ECC",
        description: "Memória abundante para caching e sessões",
        price: 160,
        type: "Memoria",
        isHardware: true,
        specs: ["32GB total", "DDR4-2666", "ECC"]
      }
    }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Solução enterprise para aplicações críticas e grande volume",
    icon: Building2,
    category: "Enterprise",
    estimatedPrice: 899,
    features: [
      "Redundância completa",
      "SLA 99.9%",
      "Suporte dedicado",
      "Compliance ready"
    ],
    components: {
      "processador": {
        id: "cpu-enterprise",
        name: "Intel Xeon Silver 4214R 12-Core",
        description: "Processador enterprise de alta disponibilidade",
        price: 450,
        type: "Processador",
        isHardware: true,
        specs: ["12 cores", "2.4 GHz base", "3.5 GHz turbo"]
      },
      "memoria": {
        id: "ram-64gb", 
        name: "64GB DDR4 ECC",
        description: "Memória enterprise para cargas críticas",
        price: 320,
        type: "Memoria",
        isHardware: true,
        specs: ["64GB total", "DDR4-2933", "ECC Registered"]
      }
    }
  },
  {
    id: "database",
    name: "Banco de Dados",
    description: "Otimizado para MySQL, PostgreSQL e aplicações data-intensive",
    icon: Database,
    category: "Database",
    estimatedPrice: 699,
    features: [
      "Storage NVMe rápido",
      "Backup automático",
      "Replicação configurada",
      "Monitoramento MySQL/PostgreSQL"
    ],
    components: {
      "processador": {
        id: "cpu-database",
        name: "Intel Xeon E-2276G 6-Core",
        description: "Processador otimizado para bancos de dados",
        price: 320,
        type: "Processador",
        isHardware: true,
        specs: ["6 cores", "3.8 GHz base", "4.9 GHz turbo"]
      },
      "memoria": {
        id: "ram-48gb",
        name: "48GB DDR4 ECC",
        description: "Memória otimizada para caching de banco",
        price: 240,
        type: "Memoria", 
        isHardware: true,
        specs: ["48GB total", "DDR4-2666", "ECC"]
      }
    }
  }
];

interface ServerTemplatesProps {
  onSelectTemplate: (template: ServerTemplate) => void;
  className?: string;
}

export function ServerTemplates({ onSelectTemplate, className }: ServerTemplatesProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Templates Rápidos</h2>
        <p className="text-muted-foreground">
          Escolha uma configuração pré-otimizada para acelerar seu setup
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {serverTemplates.map((template) => {
          const IconComponent = template.icon;
          
          return (
            <Card 
              key={template.id} 
              className={`relative transition-all duration-200 hover:shadow-lg cursor-pointer ${
                template.popular ? 'ring-2 ring-orange-500' : ''
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              {template.popular && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-orange-500 text-white flex items-center gap-1 px-2 py-1">
                    <Star className="h-3 w-3 fill-current" />
                    Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    template.popular 
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preço em destaque */}
                <div className={`rounded-lg p-3 text-center ${
                  template.popular
                    ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700'
                    : 'bg-muted/50'
                }`}>
                  <div className={`text-xl font-bold ${
                    template.popular ? 'text-orange-600 dark:text-orange-400' : 'text-primary'
                  }`}>
                    {formatCurrency(template.estimatedPrice)}
                  </div>
                  <div className={`text-xs ${
                    template.popular ? 'text-orange-500 dark:text-orange-300' : 'text-muted-foreground'
                  }`}>
                    a partir de / mês
                  </div>
                </div>

                {/* Features principais */}
                <div className="space-y-2">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                  {template.features.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{template.features.length - 3} recursos adicionais
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  variant={template.popular ? "default" : "outline"}
                  size="sm"
                >
                  Usar Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Todos os templates podem ser personalizados após a seleção
        </p>
      </div>
    </div>
  );
}
