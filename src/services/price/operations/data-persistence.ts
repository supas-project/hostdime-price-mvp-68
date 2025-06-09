
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
    console.log("[PriceService] Salvando dados de preços com categorias:", Object.keys(data).join(", "));
    
    // Verify user is authenticated before saving data
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("[PriceService] Erro de autenticação:", sessionError);
      throw new Error("Erro de autenticação: " + sessionError.message);
    }
    
    if (!session.session) {
      console.error("[PriceService] Nenhuma sessão ativa encontrada");
      throw new Error("Autenticação necessária");
    }

    // Check if user is admin
    const userEmail = session.session.user.email;
    if (userEmail !== "admin@hostdime.com.br") {
      console.error("[PriceService] Usuário não autorizado a salvar dados:", userEmail);
      throw new Error("Permissão negada: Apenas administradores podem modificar dados de preços");
    }
    
    console.log("[PriceService] Salvando dados com admin autenticado:", userEmail);
    console.log("[PriceService] Dados a serem salvos:", JSON.stringify(data, null, 2));

    // Insert a new record with the updated data
    const { error } = await supabase
      .from(PRICE_DATA_TABLE)
      .insert({
        data: data as any,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("[PriceService] Erro ao salvar dados de preços no Supabase:", error);
      throw new Error(`Erro no banco de dados: ${error.message}`);
    }

    console.log("[PriceService] Dados de preços salvos com sucesso no banco");

    // Also save in the updates table to notify other users
    const { error: updateError } = await supabase
      .from('price_data_updates')
      .insert({
        type: 'update',
        details: 'Atualização completa de dados pelo admin',
        initiator: 'admin',
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.warn("[PriceService] Aviso: Não foi possível salvar notificação de atualização:", updateError);
      // Não lance erro aqui - os dados principais foram salvos com sucesso
    }

    console.log("[PriceService] Notificação de atualização salva com sucesso");

    // Show success toast
    toast.success("Dados salvos com sucesso", { 
      description: "Os componentes foram salvos e sincronizados." 
    });

    // Notify listeners after successful save
    notifyListeners(data);
  } catch (err: any) {
    console.error("[PriceService] Erro em saveData:", err);
    
    // Only show toast for non-authentication errors
    if (!err.message.includes("autenticação") && !err.message.includes("Autenticação")) {
      toast.error("Erro ao salvar dados", {
        description: err.message
      });
    }
    
    throw err; // Re-throw the original error
  }
}
