
import { useState } from "react";
import { useAuth } from "@/contexts/auth/UnifiedAuthContext";
import { usePriceTable } from "@/hooks/usePriceTable";
import { useFileHandling } from "@/hooks/useFileHandling";
import { useDataActions } from "@/hooks/price-table/useDataActions";
import { useConsolidatedLoading } from "@/hooks/price-table/useConsolidatedLoading";
import { Navigate } from "react-router-dom";
import { PriceTablePage } from "./PriceTablePage";
import { PriceTableInitializer } from "./container/PriceTableInitializer";
import { PriceDataProcessor } from "./container/PriceDataProcessor";
import { UpdatesHandler } from "./container/UpdatesHandler";
import { DataValidator } from "./container/DataValidator";
import { PriceTableErrorBoundary } from "./PriceTableErrorBoundary";
import { PriceTableLoadingState } from "./PriceTableLoadingState";

export default function PriceTableContainer() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Consolidated loading state management
  const consolidatedLoading = useConsolidatedLoading();
  const { isLoading, loadingMessage, currentState, setLoadingState, setFileLoading, setRefreshing } = consolidatedLoading;
  
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
    hasUpdates,
    handleSyncData,
    loadPriceData,
    lastSyncTime
  } = priceTableState;

  const {
    fileInputRef,
    handleFileUpload: originalHandleFileUpload
  } = useFileHandling(setPriceData);
  
  // Data actions hook
  const {
    hasConflicts,
    checkForConflicts,
    handleRefreshData: originalHandleRefreshData,
    handleResetData
  } = useDataActions(setPriceData);

  // Wrapper for file upload with consolidated loading state
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setFileLoading(true);
      await originalHandleFileUpload(e);
    } catch (error) {
      throw error;
    } finally {
      setFileLoading(false);
    }
  };

  // Wrapper function for refresh with consolidated loading state
  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      await handleSyncData();
      await loadPriceData();
      await originalHandleRefreshData();
    } catch (error) {
      throw error;
    } finally {
      setRefreshing(false);
    }
  };

  // Show consolidated loading state
  const shouldShowLoading = isLoading || !isInitialized;
  
  if (shouldShowLoading) {
    return (
      <PriceTableErrorBoundary>
        <PriceTableLoadingState 
          loadingState={currentState}
          message={loadingMessage}
        />
      </PriceTableErrorBoundary>
    );
  }

  // Filter categories to remove contract category
  const filteredPriceData = priceData ? {...priceData} : {};
  if (filteredPriceData?.contract) {
    delete filteredPriceData.contract;
  }

  return (
    <PriceTableErrorBoundary>
      {/* Logic-only components for data management */}
      <PriceTableInitializer
        isAuthenticated={isAuthenticated}
        loadPriceData={loadPriceData}
        priceData={priceData}
        setIsInitialized={setIsInitialized}
        checkForConflicts={checkForConflicts}
        setLoadingState={setLoadingState}
      />
      
      <PriceDataProcessor
        priceData={priceData}
        setPriceData={setPriceData}
      />
      
      <UpdatesHandler
        hasUpdates={hasUpdates}
        handleRefreshData={handleRefreshData}
        setLoadingState={setLoadingState}
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
        isLoading={false}
        isRefreshing={false}
        consolidatedLoading={consolidatedLoading}
      />
    </PriceTableErrorBoundary>
  );
}
