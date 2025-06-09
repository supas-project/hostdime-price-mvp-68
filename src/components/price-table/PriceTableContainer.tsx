
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { usePriceTable } from "@/hooks/usePriceTable";
import { useFileHandling } from "@/hooks/useFileHandling";
import { useDataActions } from "@/hooks/price-table/useDataActions";
import { Navigate } from "react-router-dom";
import { PriceTablePage } from "./PriceTablePage";
import { PriceTableInitializer } from "./container/PriceTableInitializer";
import { PriceDataProcessor } from "./container/PriceDataProcessor";
import { UpdatesHandler } from "./container/UpdatesHandler";
import { DataValidator } from "./container/DataValidator";

export default function PriceTableContainer() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Custom hooks
  const priceTableState = usePriceTable();
  const {
    priceData,
    setPriceData,
    activeTab,
    tableActions,
    isLoading: dataLoading,
    hasUpdates,
    handleSyncData,
    loadPriceData,
    lastSyncTime
  } = priceTableState;

  const {
    isLoading: fileLoading,
    fileInputRef,
    handleFileUpload
  } = useFileHandling(setPriceData);
  
  // Data actions hook
  const {
    isRefreshing,
    hasConflicts,
    checkForConflicts,
    handleRefreshData: originalHandleRefreshData,
    handleResetData
  } = useDataActions(setPriceData);

  // Wrapper function to ensure sync and load happen in sequence
  const handleRefreshData = async () => {
    await handleSyncData();
    await loadPriceData();
    await originalHandleRefreshData();
  };

  // Combined loading indicator
  const isLoading = dataLoading || fileLoading || isRefreshing || !isInitialized;

  // Filter categories to remove contract category
  const filteredPriceData = priceData ? {...priceData} : {};
  if (filteredPriceData?.contract) {
    delete filteredPriceData.contract;
  }

  return (
    <>
      {/* Logic-only components for data management */}
      <PriceTableInitializer
        isAuthenticated={isAuthenticated}
        loadPriceData={loadPriceData}
        priceData={priceData}
        setIsInitialized={setIsInitialized}
        checkForConflicts={checkForConflicts}
      />
      
      <PriceDataProcessor
        priceData={priceData}
        setPriceData={setPriceData}
      />
      
      <UpdatesHandler
        hasUpdates={hasUpdates}
        handleRefreshData={handleRefreshData}
      />
      
      <DataValidator priceData={priceData} />

      {/* Main UI component */}
      <PriceTablePage 
        priceTableState={priceTableState}
        filteredPriceData={filteredPriceData}
        fileInputRef={fileInputRef}
        handleFileUpload={handleFileUpload}
        handleRefreshData={handleRefreshData}
        hasConflicts={hasConflicts}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
      />
    </>
  );
}
