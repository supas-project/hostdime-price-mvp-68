
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
    filterItems
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

  // Authentication
  const { isAuthenticated, isAdmin } = useAuth();

  // Combined loading indicator
  const isLoading = dataLoading || fileLoading;

  // Filtrar categorias para remover a categoria de contratos
  const filteredPriceData = {...priceData};
  if (filteredPriceData.contract) {
    delete filteredPriceData.contract;
  }

  return (
    <div className="container py-8 animate-fade-in">
      <PriceTableHeader lastSyncTime={lastSyncTime} />

      <Card className="border border-border rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-wrap justify-between items-center gap-2">
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

            <div className="flex gap-2 ml-auto">
              {isAdmin && (
                <ImportButton 
                  isLoading={isLoading}
                  fileInputRef={fileInputRef}
                  onFileUpload={handleFileUpload}
                />
              )}
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
          />
        </CardContent>
      </Card>
    </div>
  );
}
