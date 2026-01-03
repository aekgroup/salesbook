import { exportAllData } from '../dexie/db';
import { ProductService, StatusService, SaleService, PreferencesService } from './services';
import { authService } from './auth';

export interface MigrationResult {
  success: boolean;
  message: string;
  migrated: {
    products: number;
    statuses: number;
    sales: number;
    saleItems: number;
    preferences: number;
  };
  errors: string[];
}

export class MigrationService {
  static async migrateFromDexie(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      migrated: {
        products: 0,
        statuses: 0,
        sales: 0,
        saleItems: 0,
        preferences: 0
      },
      errors: []
    };

    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        return {
          ...result,
          success: false,
          message: 'Utilisateur non authentifié. Veuillez vous connecter pour migrer les données.'
        };
      }

      // Export data from Dexie
      const dexieData = await exportAllData();

      // Migrate statuses first (products depend on them)
      if (dexieData.statuses.length > 0) {
        try {
          for (const status of dexieData.statuses) {
            await StatusService.create({
              label: status.label,
              color: status.color,
              isDefault: status.isDefault,
              order: status.order
            });
          }
          result.migrated.statuses = dexieData.statuses.length;
        } catch (error) {
          result.errors.push(`Erreur lors de la migration des statuts: ${error}`);
        }
      }

      // Migrate products
      if (dexieData.products.length > 0) {
        try {
          for (const product of dexieData.products) {
            await ProductService.create({
              sku: product.sku,
              name: product.name,
              category: product.category,
              brand: product.brand,
              purchasePrice: product.purchasePrice,
              salePrice: product.salePrice,
              quantity: product.quantity,
              statusId: product.statusId,
              reorderThreshold: product.reorderThreshold
            });
          }
          result.migrated.products = dexieData.products.length;
        } catch (error) {
          result.errors.push(`Erreur lors de la migration des produits: ${error}`);
        }
      }

      // Migrate sales and sale items
      if (dexieData.sales.length > 0) {
        try {
          for (const sale of dexieData.sales) {
            // Get sale items for this sale
            const saleItems = dexieData.saleItems.filter(item => item.saleId === sale.id);
            
            await SaleService.create({
              date: sale.date,
              items: saleItems,
              totalRevenue: sale.totalRevenue,
              totalCost: sale.totalCost,
              totalProfit: sale.totalProfit,
              paymentMethod: sale.paymentMethod,
              note: sale.note
            });
          }
          result.migrated.sales = dexieData.sales.length;
          result.migrated.saleItems = dexieData.saleItems.length;
        } catch (error) {
          result.errors.push(`Erreur lors de la migration des ventes: ${error}`);
        }
      }

      // Migrate preferences
      try {
        const prefs = await PreferencesService.get();
        if (!prefs) {
          // Get preferences from Dexie
          const { db } = await import('../dexie/db');
          const dexiePrefs = await db.preferences.toArray();
          
          if (dexiePrefs.length > 0) {
            const pref = dexiePrefs[0];
            await PreferencesService.update({
              currency: pref.currency,
              paymentMethods: pref.paymentMethods
            });
            result.migrated.preferences = 1;
          }
        } else {
          result.migrated.preferences = 1;
        }
      } catch (error) {
        result.errors.push(`Erreur lors de la migration des préférences: ${error}`);
      }

      // Check if migration was successful
      const totalErrors = result.errors.length;
      const totalMigrated = Object.values(result.migrated).reduce((sum, count) => sum + count, 0);

      if (totalErrors === 0 && totalMigrated > 0) {
        result.success = true;
        result.message = 'Migration réussie!';
      } else if (totalMigrated > 0) {
        result.success = false;
        result.message = `Migration partielle: ${totalMigrated} éléments migrés avec ${totalErrors} erreurs`;
      } else {
        result.success = false;
        result.message = 'Échec de la migration';
      }

    } catch (error) {
      result.success = false;
      result.message = `Erreur générale de migration: ${error}`;
      result.errors.push(`Erreur générale: ${error}`);
    }

    return result;
  }

  static async checkMigrationNeeded(): Promise<boolean> {
    try {
      // Check if there's any data in Supabase
      const [products, statuses, sales] = await Promise.all([
        ProductService.getAll(),
        StatusService.getAll(),
        SaleService.getAll()
      ]);

      // If any data exists in Supabase, assume migration is not needed
      const hasSupabaseData = products.length > 0 || statuses.length > 0 || sales.length > 0;

      if (hasSupabaseData) {
        return false;
      }

      // Check if there's data in Dexie
      const dexieData = await exportAllData();
      const hasDexieData = dexieData.products.length > 0 || 
                          dexieData.statuses.length > 0 || 
                          dexieData.sales.length > 0;

      return hasDexieData;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  static async clearSupabaseData(): Promise<void> {
    // Clear in order to respect foreign key constraints
    await Promise.all([
      SaleService.getAll().then(sales => 
        Promise.all(sales.map(sale => SaleService.delete(sale.id)))
      ),
      ProductService.getAll().then(products => 
        Promise.all(products.map(product => ProductService.delete(product.id)))
      ),
      StatusService.getAll().then(statuses => 
        Promise.all(statuses.map(status => StatusService.delete(status.id)))
      )
    ]);
  }
}
