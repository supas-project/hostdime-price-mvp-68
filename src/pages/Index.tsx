
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FloatingCart } from "@/components/floating-cart";
import { FinalSummary } from "@/components/final-summary";
import { ProgressIndicator } from "@/components/progress-indicator";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, ArrowRight, ArrowLeft, Plus, Minus } from "lucide-react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const Index = () => {
  const { 
    items, 
    categories, 
    status, 
    selectedComponents, 
    selectComponent, 
    removeComponent,
    updateComponentQuantity,
    clearSelection,
    getComponentsByCategory,
    getTotalPrice,
    getSelectedComponentsCount 
  } = useAppStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  // Se não há dados carregados ainda
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Erro ao carregar dados</p>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  const currentCategory = categories[currentStep];
  const categoryItems = currentCategory ? getComponentsByCategory(currentCategory) : [];
  const totalSteps = categories.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowFinalSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setShowFinalSummary(false);
    clearSelection();
  };

  const getSelectedQuantity = (itemId: number) => {
    const selected = selectedComponents.find(
      sc => sc.category === currentCategory && sc.component.id === itemId
    );
    return selected ? selected.quantity : 0;
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeComponent(currentCategory, itemId);
    } else {
      updateComponentQuantity(currentCategory, itemId, quantity);
    }
  };

  if (showFinalSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <FinalSummary 
          selectedComponents={selectedComponents}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Configure seu Servidor
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Selecione as opções ideais para seu servidor dedicado em poucos passos
          </p>
        </div>

        <ProgressIndicator 
          currentStep={currentStep}
          totalSteps={totalSteps}
          categories={categories}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentCategory}</span>
                  <Badge variant="secondary">
                    {currentStep + 1} de {totalSteps}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Selecione os componentes para {currentCategory}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum componente disponível nesta categoria
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {categoryItems.map((item) => {
                      const selectedQuantity = getSelectedQuantity(item.id);
                      
                      return (
                        <Card key={item.id} className={cn(
                          "transition-all duration-200",
                          selectedQuantity > 0 && "ring-2 ring-blue-500"
                        )}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold">{item.name}</h3>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                )}
                                {item.specifications && item.specifications.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {item.specifications.map((spec, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {spec}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="font-semibold text-lg">
                                    {formatCurrency(item.price)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    por mês
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {selectedQuantity > 0 ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuantityChange(item.id, selectedQuantity - 1)}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="w-8 text-center font-medium">
                                        {selectedQuantity}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuantityChange(item.id, selectedQuantity + 1)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      onClick={() => selectComponent(currentCategory, item, 1)}
                                      size="sm"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Adicionar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  
                  <Button onClick={handleNext}>
                    {currentStep === totalSteps - 1 ? 'Finalizar' : 'Próximo'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-4">
            <FloatingCart
              selectedComponents={selectedComponents}
              currentStep={currentStep}
              totalSteps={totalSteps}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onComplete={() => setShowFinalSummary(true)}
              onClear={clearSelection}
              totalPrice={getTotalPrice()}
              totalItems={getSelectedComponentsCount()}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
