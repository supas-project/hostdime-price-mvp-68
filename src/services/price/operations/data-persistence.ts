
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
    console.log("[PriceService] Salvando dados de preço com categorias:", Object.keys(data).join(", "));
    
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
    const isAdmin = userEmail === "admin@hostdime.com.br";
    
    // Always allow these categories to be modified by any authenticated user
    const allowedCategories = ['discos_internos', 'disk', 'external_storage'];
    
    let hasChangesOnlyInAllowedCategories = true;
    let hasChanges = false;
    
    // Get current data to compare changes
    const { data: currentData } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('data')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (currentData && currentData.data) {
      const existingData = currentData.data as any;
      
      // Check each category for changes
      for (const categoryId of Object.keys(data)) {
        const currentCategory = existingData[categoryId];
        const newCategory = data[categoryId];
        
        // Skip if both undefined/null
        if (!currentCategory && !newCategory) continue;
        
        // If they differ and it's not an allowed category, mark as having restricted changes
        if (JSON.stringify(currentCategory) !== JSON.stringify(newCategory)) {
          hasChanges = true;
          
          if (!allowedCategories.includes(categoryId)) {
            hasChangesOnlyInAllowedCategories = false;
          }
        }
      }
    }
    
    // If user is not admin and trying to modify restricted categories
    if (!isAdmin && !hasChangesOnlyInAllowedCategories) {
      console.error("[PriceService] Usuário não autorizado a salvar todos os dados:", userEmail);
      throw new Error("Permissão negada: Apenas administradores podem modificar certos dados de preço");
    }
    
    console.log("[PriceService] Salvando dados com usuário autenticado:", userEmail);

    // First check for existing records to determine if we should update or insert
    const { data: existingData, error: fetchError } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (fetchError) {
      console.error("[PriceService] Erro ao verificar dados de preço existentes:", fetchError);
      throw new Error(fetchError.message);
    }
    
    let saveError;
    
    if (existingData && existingData.length > 0) {
      // Update the most recent record instead of creating a new one
      const { error } = await supabase
        .from(PRICE_DATA_TABLE)
        .update({
          data: data as any, // Cast to any to bypass type checking
          updated_at: new Date().toISOString() // Convert Date to ISO string
        })
        .eq('id', existingData[0].id);
        
      saveError = error;
      console.log("[PriceService] Registro existente atualizado:", existingData[0].id);
    } else {
      // Insert a new record if none exists
      const { error } = await supabase
        .from(PRICE_DATA_TABLE)
        .insert({
          data: data as any, // Cast to any to bypass type checking
          updated_at: new Date().toISOString() // Convert Date to ISO string
        });
        
      saveError = error;
      console.log("[PriceService] Novo registro de dados de preço criado");
    }

    if (saveError) {
      console.error("[PriceService] Erro ao salvar dados de preço:", saveError);
      throw new Error(saveError.message);
    }

    // Only add to updates table if there were actual changes
    if (hasChanges) {
      // Also save in the updates table to notify other users
      await supabase
        .from('price_data_updates')
        .insert({
          type: 'update',
          details: 'Data update by ' + (isAdmin ? 'admin' : 'user'),
          initiator: userEmail || 'unknown',
          updated_at: new Date().toISOString()
        });
    }
    
    console.log("[PriceService] Dados de preço salvos com sucesso");
    toast.success("Dados salvos com sucesso", { 
      description: "As alterações foram salvas e sincronizadas." 
    });

    // Notificar listeners após salvamento bem-sucedido
    notifyListeners(data);
    
    // Update the local cache timestamp to prevent unnecessary refresh prompts
    localStorage.setItem('price_data_last_fetch', new Date().toISOString());
  } catch (err: any) {
    console.error("[PriceService] Erro em saveData:", err);
    if (!err.message.includes("Authentication")) {
      toast.error("Erro ao salvar dados", {
        description: err.message
      });
    }
    throw new Error(err.message || "Falha ao salvar dados de preço.");
  }
}
