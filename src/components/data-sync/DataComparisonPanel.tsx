
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ComponentService } from '@/services/component-service-refactored';
import { PriceService } from '@/services/price-service';
import { GitCompare, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface CategoryComparison {
  categoryId: string;
  configName: string;
  priceName: string | null;
  configCount: number;
  priceCount: number;
  missingInPrice: string[];
  extraInPrice: string[];
  configItems: any[];
  priceItems: any[];
}

export function DataComparisonPanel() {
  const [comparison, setComparison] = useState<CategoryComparison[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const runComparison = async () => {
    setIsLoading(true);
    try {
      console.log('[DataComparison] Starting comparison...');
      
      // Get data from both sources
      const [configData, priceData] = await Promise.all([
        ComponentService.getAllComponentsByCategory(),
        PriceService.getAllData()
      ]);

      console.log('[DataComparison] Config categories:', Object.keys(configData));
      console.log('[DataComparison] Price categories:', Object.keys(priceData));

      // Map category names
      const categoryMapping: Record<string, string> = {
        'cpu': 'processor',
        'memory': 'memoria', 
        'os': 'sistemaoperacional',
        'connectivity': 'connectivity',
        'storage': 'storage',
        'datacenter': 'datacenter',
        'contract': 'contract'
      };

      const comparisons: CategoryComparison[] = [];

      // Compare each config category
      for (const [configCat, configItems] of Object.entries(configData)) {
        const mappedCat = categoryMapping[configCat] || configCat;
        const priceCategory = priceData[mappedCat] || priceData[configCat];
        
        const configItemIds = configItems.map(item => item.id);
        const priceItems = priceCategory?.items || [];
        const priceItemIds = priceItems.map(item => item.id);

        const missingInPrice = configItems
          .filter(item => !priceItemIds.includes(item.id))
          .map(item => item.name);

        const extraInPrice = priceItems
          .filter(item => !configItemIds.includes(item.id))
          .map(item => item.name);

        comparisons.push({
          categoryId: configCat,
          configName: getCategoryDisplayName(configCat),
          priceName: priceCategory ? priceCategory.name : null,
          configCount: configItems.length,
          priceCount: priceItems.length,
          missingInPrice,
          extraInPrice,
          configItems,
          priceItems
        });
      }

      // Check for categories only in price table
      for (const [priceCat, priceCategory] of Object.entries(priceData)) {
        const reverseMapping = Object.entries(categoryMapping).find(([_, mapped]) => mapped === priceCat);
        const configCat = reverseMapping ? reverseMapping[0] : priceCat;
        
        if (!configData[configCat] && !configData[priceCat]) {
          comparisons.push({
            categoryId: priceCat,
            configName: null,
            priceName: priceCategory.name,
            configCount: 0,
            priceCount: priceCategory.items?.length || 0,
            missingInPrice: [],
            extraInPrice: priceCategory.items?.map(item => item.name) || [],
            configItems: [],
            priceItems: priceCategory.items || []
          });
        }
      }

      setComparison(comparisons);
      console.log('[DataComparison] Comparison completed:', comparisons);

    } catch (error) {
      console.error('[DataComparison] Error during comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, []);

  const getCategoryDisplayName = (categoryId: string): string => {
    const displayNames: Record<string, string> = {
      'cpu': 'Processadores',
      'memory': 'Memória',
      'os': 'Sistema Operacional',
      'connectivity': 'Conectividade',
      'storage': 'Armazenamento',
      'datacenter': 'Data Center',
      'contract': 'Contratos'
    };
    return displayNames[categoryId] || categoryId;
  };

  const getTotalIssues = () => {
    return comparison.reduce((total, comp) => 
      total + comp.missingInPrice.length + comp.extraInPrice.length, 0
    );
  };

  const hasIssues = getTotalIssues() > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="w-5 h-5" />
          Comparação de Dados
        </CardTitle>
        <CardDescription>
          Compare categorias e itens entre Configurações e Tabela de Preços
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Summary */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {hasIssues ? (
              <>
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-medium">
                  {getTotalIssues()} divergência(s) encontrada(s)
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Dados sincronizados</span>
              </>
            )}
          </div>
          <Button onClick={runComparison} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? 'Comparando...' : 'Atualizar'}
          </Button>
        </div>

        {/* Categories Comparison */}
        <div className="space-y-3">
          {comparison.map((comp) => {
            const categoryIssues = comp.missingInPrice.length + comp.extraInPrice.length;
            const isExpanded = showDetails === comp.categoryId;

            return (
              <Card key={comp.categoryId} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comp.configName || 'N/A'}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {comp.priceName || 'Não existe'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            Config: {comp.configCount} itens
                          </Badge>
                          <Badge variant="outline">
                            Preços: {comp.priceCount} itens
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {categoryIssues > 0 && (
                        <Badge variant="destructive">
                          {categoryIssues} divergência(s)
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(isExpanded ? null : comp.categoryId)}
                      >
                        {isExpanded ? 'Ocultar' : 'Detalhes'}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-3">
                        {comp.missingInPrice.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-destructive mb-2">
                              Ausentes na Tabela de Preços ({comp.missingInPrice.length}):
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {comp.missingInPrice.map((item) => (
                                <Badge key={item} variant="destructive" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {comp.extraInPrice.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-orange-600 mb-2">
                              Extras na Tabela de Preços ({comp.extraInPrice.length}):
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {comp.extraInPrice.map((item) => (
                                <Badge key={item} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {comp.missingInPrice.length === 0 && comp.extraInPrice.length === 0 && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Categoria sincronizada</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {hasIssues && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Foram encontradas divergências entre os dados de configuração e a tabela de preços. 
              Use o painel de sincronização para corrigir estas divergências.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
