
import { PriceService } from './price-service';
import { toast } from '@/utils/toast-utils';
import { 
  initializeServerCategories, 
  cleanupDuplicateCategories,
  syncDiskDataWithPriceService
} from './component-sync-service';

/**
 * Service for initializing application data
 */
export class InitService {
  /**
   * Initialize the application data
   * This ensures all necessary data is available and correctly structured
   * It automatically handles all data dependencies
   */
  static async initializeData(): Promise<boolean> {
    try {
      console.log("[InitService] Starting data initialization");
      
      // Check if user is authenticated
      const { data: session } = await PriceService.supabase.auth.getSession();
      
      if (!session.session) {
        console.log("[InitService] No authenticated session, skipping initialization");
        return false;
      }
      
      console.log("[InitService] Authenticated user, continuing initialization");
      
      // First cleanup any duplicate categories to avoid issues
      await cleanupDuplicateCategories();
      
      // Then initialize all server categories
      await initializeServerCategories();
      
      // Sync disk data for storage categories
      await syncDiskDataWithPriceService();
      
      console.log("[InitService] Data initialization completed successfully");
      
      return true;
    } catch (error) {
      console.error("[InitService] Error initializing data:", error);
      
      // Only show toast for non-authentication errors
      if (error instanceof Error && !error.message.includes("Authentication")) {
        toast.error("Erro na inicialização", {
          description: "Falha ao inicializar dados da aplicação."
        });
      }
      
      return false;
    }
  }
}
