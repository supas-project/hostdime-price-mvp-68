
import { CoreMigrationService } from './data-migration/core-migration-service';

/**
 * Legacy migration service - now delegates to CoreMigrationService
 * Keeping for backward compatibility
 */
export class DataMigrationService {
  /**
   * @deprecated Use CoreMigrationService.runProductionMigration instead
   */
  static async runCompleteMigration(): Promise<void> {
    return CoreMigrationService.runProductionMigration();
  }

  /**
   * @deprecated Use CoreMigrationService.checkMigrationStatus instead
   */
  static async checkMigrationStatus(): Promise<{needed: boolean; summary: string}> {
    const status = await CoreMigrationService.checkMigrationStatus();
    return {
      needed: status.needed,
      summary: status.summary
    };
  }

  // Re-export all individual migration methods for compatibility
  static migrateCPUComponents = CoreMigrationService['migrateCPUComponents'];
  static migrateMemoryComponents = CoreMigrationService['migrateMemoryComponents'];
  static migrateOSComponents = CoreMigrationService['migrateOSComponents'];
  static migrateConnectivityComponents = CoreMigrationService['migrateConnectivityComponents'];
  static migrateDataCenters = CoreMigrationService['migrateDataCenters'];
  static migrateContractTypes = CoreMigrationService['migrateContractTypes'];
}
