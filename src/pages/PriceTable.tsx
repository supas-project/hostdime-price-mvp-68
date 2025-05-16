
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePriceTable } from "@/hooks/usePriceTable";
import { usePriceTableActions } from "@/hooks/price-table";
import { useFileHandling } from "@/hooks/useFileHandling";
import { PriceTableHeader } from "@/components/price-table/PriceTableHeader";
import { TableControls } from "@/components/price-table/TableControls";
import { TableActions } from "@/components/price-table/TableActions";
import { PriceTableContent } from "@/components/price-table/PriceTableContent";
import { ImportButton } from "@/components/price-table/ImportButton";
import { ContractSelect } from "@/components/price-table/ContractSelect";
import { useDataActions } from "@/hooks/price-table/useDataActions";
import { SyncIndicator } from "@/components/price-table/SyncIndicator";
import { useDataSync } from "@/hooks/useDataSync";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function PriceTable() {
  // Custom hooks
  const {
    priceData,
    setPriceData,
    activeTab,
    setActiveTab,
    isLoading: dataLoading,
    lastSyncTime,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    displayMode,
    setDisplayMode,
    collapsedCategories,
    toggleCategoryCollapse,
    filterItems,
    contractDuration,
    setContractDuration
  } = usePriceTable();

  const {
    openAddCategory,
    setOpenAddCategory,
    openAddItem,
    setOpenAddItem,
    openEditItem,
    setOpenEditItem,
    itemToEdit,
    setItemToEdit,
    handleAddCategory,
    handleAddItem,
    handleEditItem,
    handleInitiateEdit,
    handleDeleteCategory,
    handleDeleteItem,
    handleExportData,
    handleResetData
  } = usePriceTableActions(activeTab, setPriceData);

  const {
    isLoading: fileLoading,
    fileInputRef,
    handleFileUpload
  } = useFileHandling(setPriceData);
  
  // Data actions hook para lidar com sincronização e conflitos
  const {
    isRefreshing,
    hasConflicts,
    handleRefreshData
  } = useDataActions(setPriceData);
  
  // Hook de sincronização
  const { lastSyncTime: syncTime, hasUpdates } = useDataSync();

  // Authentication
  const { isAuthenticated, isAdmin } = useAuth();

  // Combined loading indicator
  const isLoading = dataLoading || fileLoading || isRefreshing;

  // Effect para forçar atualização quando hasUpdates for true
  useEffect(() => {
    if (hasUpdates) {
      handleRefreshData();
    }
  }, [hasUpdates]);

  // Filtrar categorias para remover a categoria de contratos
  const filteredPriceData = {...priceData};
  if (filteredPriceData.contract) {
    delete filteredPriceData.contract;
  }

  return (
    <div className="container py-6 md:py-8 animate-fade-in">
      <PriceTableHeader lastSyncTime={lastSyncTime} />

      {!isAdmin && (
        <Alert className="mb-4 border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle>Modo de visualização</AlertTitle>
          <AlertDescription>
            Você está no modo de visualização. Apenas administradores podem editar esta tabela.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border border-border rounded-xl shadow-lg overflow-hidden mt-6">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
            {isAdmin && (
              <TableActions
                activeTab={activeTab}
                priceData={filteredPriceData}
                openAddCategory={openAddCategory}
                openAddItem={openAddItem}
                openEditItem={openEditItem}
                itemToEdit={itemToEdit}
                setOpenAddCategory={setOpenAddCategory}
                setOpenAddItem={setOpenAddItem}
                setOpenEditItem={setOpenEditItem}
                setItemToEdit={setItemToEdit}
                onAddCategory={handleAddCategory}
                onAddItem={handleAddItem}
                onEditItem={handleEditItem}
                onExportData={handleExportData}
                onResetData={handleResetData}
              />
            )}

            <div className="flex flex-col sm:flex-row gap-2 ml-auto">
              <SyncIndicator 
                lastSyncTime={lastSyncTime} 
                hasConflicts={hasConflicts}
                onRefresh={handleRefreshData}
                isRefreshing={isRefreshing}
              />
              
              <div className="flex gap-2">
                <ContractSelect 
                  value={contractDuration}
                  onChange={setContractDuration}
                />
                
                {isAdmin && (
                  <ImportButton 
                    isLoading={isLoading}
                    fileInputRef={fileInputRef}
                    onFileUpload={handleFileUpload}
                  />
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <TableControls 
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            onSearchChange={setSearchTerm}
            onSortChange={setSortOrder}
            sortOrder={sortOrder}
          />

          <PriceTableContent
            priceData={filteredPriceData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
            searchTerm={searchTerm}
            sortOrder={sortOrder}
            displayMode={displayMode}
            collapsedCategories={collapsedCategories}
            toggleCategoryCollapse={toggleCategoryCollapse}
            filterItems={filterItems}
            onDeleteCategory={handleDeleteCategory}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleInitiateEdit}
            contractDuration={contractDuration}
          />
        </CardContent>
      </Card>
    </div>
  );
}
