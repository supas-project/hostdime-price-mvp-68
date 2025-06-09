
import { supabase } from '@/lib/supabase';
import { PriceData } from '@/types/pricing';
import { PRICE_DATA_TABLE } from '../constants';
import { toast } from 'sonner';
import { notifyListeners } from '../listeners';

/**
 * Saves price data to the database with improved error handling and verification
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

    // Use upsert approach to ensure data is saved correctly
    const timestamp = new Date().toISOString();
    
    // First, delete any existing records older than 1 minute to prevent accumulation
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { error: cleanupError } = await supabase
      .from(PRICE_DATA_TABLE)
      .delete()
      .lt('created_at', oneMinuteAgo);
    
    if (cleanupError) {
      console.warn("[PriceService] Aviso: Falha na limpeza de registros antigos:", cleanupError);
      // Don't throw here, just warn
    }

    // Insert the new record
    const { data: insertedData, error: insertError } = await supabase
      .from(PRICE_DATA_TABLE)
      .insert({
        data: data as any,
        updated_at: timestamp
      })
      .select()
      .single();

    if (insertError) {
      console.error("[PriceService] Erro ao inserir dados de preços no Supabase:", insertError);
      throw new Error(`Erro no banco de dados: ${insertError.message}`);
    }

    console.log("[PriceService] Dados de preços salvos com sucesso no banco, ID:", insertedData?.id);

    // Verify the data was actually saved by querying it back
    const { data: verificationData, error: verifyError } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('data')
      .eq('id', insertedData.id)
      .single();

    if (verifyError || !verificationData) {
      console.error("[PriceService] Falha na verificação dos dados salvos:", verifyError);
      throw new Error("Falha na verificação dos dados salvos");
    }

    const savedData = verificationData.data as PriceData;
    const savedCategories = Object.keys(savedData);
    const originalCategories = Object.keys(data);
    
    console.log("[PriceService] Verificação: categorias originais:", originalCategories.join(", "));
    console.log("[PriceService] Verificação: categorias salvas:", savedCategories.join(", "));
    
    // Check if all expected categories were saved and unwanted ones were removed
    const hasAllExpectedCategories = originalCategories.every(cat => savedCategories.includes(cat));
    const hasOnlyExpectedCategories = savedCategories.every(cat => originalCategories.includes(cat));
    
    if (!hasAllExpectedCategories || !hasOnlyExpectedCategories) {
      console.error("[PriceService] ERRO: Dados salvos não correspondem aos dados enviados!");
      console.error("[PriceService] Esperado:", originalCategories);
      console.error("[PriceService] Salvo:", savedCategories);
      throw new Error("Dados salvos não correspondem aos dados enviados");
    }

    // Also save in the updates table to notify other users
    const { error: updateError } = await supabase
      .from('price_data_updates')
      .insert({
        type: 'update',
        details: 'Atualização completa de dados pelo admin',
        initiator: 'admin',
        updated_at: timestamp
      });

    if (updateError) {
      console.warn("[PriceService] Aviso: Não foi possível salvar notificação de atualização:", updateError);
      // Não lance erro aqui - os dados principais foram salvos com sucesso
    }

    console.log("[PriceService] Operação de salvamento concluída com sucesso");

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
