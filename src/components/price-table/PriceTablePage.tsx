
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useDataSync } from "@/hooks/useDataSync";
import { PriceTableHeader } from "@/components/price-table/PriceTableHeader";
import { TableControls } from "@/components/price-table/TableControls";
import { TableActions } from "@/components/price-table/TableActions";
import { PriceTableContent } from "@/components/price-table/PriceTableContent";
import { ImportButton } from "@/components/price-table/ImportButton";
import { ContractSelect } from "@/components/price-table/ContractSelect";
import { SyncIndicator } from "@/components/price-table/SyncIndicator";
import { PriceData } from "@/types/pricing";

interface PriceTablePageProps {
  priceTableState: any;
  filteredPriceData: PriceData;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRefreshData: () => void;
  hasConflicts: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
}

export function PriceTablePage({
  priceTableState,
  filteredPriceData,
  fileInputRef,
  handleFileUpload,
  handleRefreshData,
  hasConflicts,
  isLoading,
  isRefreshing
}: PriceTablePageProps) {
  const { isAdminAccess } = useDataSync();
  const {
    activeTab,
    setActiveTab,
    tableActions,
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
  } = priceTableState;

  return (
    <div className="container py-6 md:py-8 animate-fade-in">
      <PriceTableHeader lastSyncTime={lastSyncTime} />

      {!isAdminAccess && (
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
            <PriceTableHeaderActions
              isAdminAccess={isAdminAccess}
              activeTab={activeTab}
              filteredPriceData={filteredPriceData}
              tableActions={tableActions}
            />

            <PriceTableHeaderControls
              lastSyncTime={lastSyncTime}
              hasConflicts={hasConflicts}
              handleRefreshData={handleRefreshData}
              isRefreshing={isRefreshing}
              contractDuration={contractDuration}
              setContractDuration={setContractDuration}
              isAdminAccess={isAdminAccess}
              isLoading={isLoading}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
            />
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
            isAdmin={isAdminAccess}
            searchTerm={searchTerm}
            sortOrder={sortOrder}
            displayMode={displayMode}
            collapsedCategories={collapsedCategories}
            toggleCategoryCollapse={toggleCategoryCollapse}
            filterItems={filterItems}
            onDeleteCategory={tableActions.handleDeleteCategory}
            onDeleteItem={tableActions.handleDeleteItem}
            onEditItem={tableActions.handleInitiateEdit}
            contractDuration={contractDuration}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Header actions component
function PriceTableHeaderActions({
  isAdminAccess,
  activeTab,
  filteredPriceData,
  tableActions
}) {
  if (!isAdminAccess) return null;
  
  return (
    <TableActions
      activeTab={activeTab}
      priceData={filteredPriceData}
      openAddCategory={tableActions.openAddCategory}
      openAddItem={tableActions.openAddItem}
      openEditItem={tableActions.openEditItem}
      itemToEdit={tableActions.itemToEdit}
      setOpenAddCategory={tableActions.setOpenAddCategory}
      setOpenAddItem={tableActions.setOpenAddItem}
      setOpenEditItem={tableActions.setOpenEditItem}
      setItemToEdit={tableActions.setItemToEdit}
      onAddCategory={tableActions.handleAddCategory}
      onAddItem={tableActions.handleAddItem}
      onEditItem={tableActions.handleEditItem}
      onExportData={tableActions.handleExportData}
      onResetData={tableActions.handleResetData}
    />
  );
}

// Header controls component
function PriceTableHeaderControls({
  lastSyncTime,
  hasConflicts,
  handleRefreshData,
  isRefreshing,
  contractDuration,
  setContractDuration,
  isAdminAccess,
  isLoading,
  fileInputRef,
  handleFileUpload
}) {
  return (
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
          onChange={(value) => setContractDuration(value)}
        />
        
        {isAdminAccess && (
          <ImportButton 
            isLoading={isLoading}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
          />
        )}
      </div>
    </div>
  );
}
