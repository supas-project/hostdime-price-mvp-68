
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { FileText, Building, Users, Briefcase } from 'lucide-react';

export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'corporate' | 'technical' | 'commercial';
  features: string[];
  icon: React.ComponentType<any>;
}

const templates: PDFTemplate[] = [
  {
    id: 'hostdime-corporate',
    name: 'HostDime Corporativo',
    description: 'Template oficial com branding HostDime completo',
    preview: 'Cabeçalho com logo, seções organizadas, rodapé profissional',
    category: 'corporate',
    features: ['Logo HostDime', 'Cores corporativas', 'Layout formal'],
    icon: Building
  },
  {
    id: 'technical-detailed',
    name: 'Técnico Detalhado',
    description: 'Foco em especificações técnicas e diagramas',
    preview: 'Seções técnicas expandidas, tabelas de especificações',
    category: 'technical',
    features: ['Especificações técnicas', 'Diagramas', 'Tabelas detalhadas'],
    icon: FileText
  },
  {
    id: 'commercial-simple',
    name: 'Comercial Simplificado',
    description: 'Layout limpo focado em preços e benefícios',
    preview: 'Apresentação clara de preços, benefícios destacados',
    category: 'commercial',
    features: ['Foco em preços', 'Benefícios destacados', 'Layout limpo'],
    icon: Briefcase
  },
  {
    id: 'client-presentation',
    name: 'Apresentação Cliente',
    description: 'Template otimizado para apresentações executivas',
    preview: 'Visual moderno, gráficos, resumo executivo',
    category: 'commercial',
    features: ['Gráficos visuais', 'Resumo executivo', 'Design moderno'],
    icon: Users
  }
];

interface PDFTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

export function PDFTemplateSelector({ selectedTemplate, onTemplateChange }: PDFTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'corporate', name: 'Corporativo' },
    { id: 'technical', name: 'Técnico' },
    { id: 'commercial', name: 'Comercial' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Selecionar Template PDF</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha o template que melhor se adequa ao tipo de apresentação
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Template Selection */}
      <RadioGroup value={selectedTemplate} onValueChange={onTemplateChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onTemplateChange(template.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={template.id} id={template.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-3">
                    {template.preview}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
