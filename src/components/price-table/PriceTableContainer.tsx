
import { useState } from "react";
import { useAuth } from "@/contexts/auth/UnifiedAuthContext";
import { usePriceTable } from "@/hooks/usePriceTable";
import { useFileHandling } from "@/hooks/useFileHandling";
import { useDataActions } from "@/hooks/price-table/useDataActions";
import { useLoadingStates } from "@/hooks/price-table/useLoadingStates";
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
  const { currentState, isLoading, loadingMessage, setLoadingState } = useLoadingStates();
  
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
    isLoading: fileLoading,
    fileInputRef,
    handleFileUpload: originalHandleFileUpload
  } = useFileHandling(setPriceData);
  
  // Data actions hook
  const {
    isRefreshing,
    hasConflicts,
    checkForConflicts,
    handleRefreshData: originalHandleRefreshData,
    handleResetData
  } = useDataActions(setPriceData);

  // Wrapper for file upload with loading state
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoadingState('uploading-file');
      await originalHandleFileUpload(e);
      setLoadingState('idle');
    } catch (error) {
      setLoadingState('idle');
      throw error;
    }
  };

  // Wrapper function to ensure sync and load happen in sequence with loading states
  const handleRefreshData = async () => {
    try {
      setLoadingState('syncing');
      await handleSyncData();
      await loadPriceData();
      await originalHandleRefreshData();
      setLoadingState('idle');
    } catch (error) {
      setLoadingState('idle');
      throw error;
    }
  };

  // Show consolidated loading state - combine all loading conditions
  const shouldShowLoading = isLoading || fileLoading || !isInitialized;
  
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
        isRefreshing={isRefreshing}
      />
    </PriceTableErrorBoundary>
  );
}
