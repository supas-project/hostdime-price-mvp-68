
import { supabase } from '@/lib/supabase';
import { PriceData } from '@/types/pricing';
import { PRICE_DATA_TABLE } from '../constants';
import { toast } from 'sonner';
import { notifyListeners } from '../listeners';

/**
 * Saves price data to the database
 */
export async function saveData(data: PriceData): Promise<void> {
  try {
    console.log("[PriceService] Saving price data with categories:", Object.keys(data).join(", "));
    // Verificar se o usuário está autenticado antes de salvar dados
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("[PriceService] Authentication error:", sessionError);
      toast.error("Erro de autenticação", { 
        description: "Não foi possível verificar sua autenticação. Tente fazer login novamente." 
      });
      throw new Error("Authentication error: " + sessionError.message);
    }
    
    if (!session.session) {
      console.warn("[PriceService] No active session found, trying to proceed anyway");
    } else {
      console.log("[PriceService] Saving data with authenticated user:", session.session.user.email);
    }

    // Insert a new record with the updated data
    // We need to cast data to Json type for Supabase
    const { error } = await supabase
      .from(PRICE_DATA_TABLE)
      .insert({
        data: data as any, // Cast to any to bypass type checking
        updated_at: new Date().toISOString() // Convert Date to ISO string
      });

    if (error) {
      console.error("[PriceService] Error saving price data:", error);
      throw new Error(error.message);
    }

    console.log("[PriceService] Price data saved successfully");
    toast.success("Dados salvos com sucesso", { 
      description: "Os componentes foram salvos e sincronizados." 
    });

    // Notificar listeners após salvar os dados com sucesso
    notifyListeners();
  } catch (err: any) {
    console.error("[PriceService] Error in saveData:", err);
    throw new Error(err.message || "Failed to save price data.");
  }
}
