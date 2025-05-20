
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
    
    // Verify user is authenticated before saving data
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("[PriceService] Authentication error:", sessionError);
      throw new Error("Authentication error: " + sessionError.message);
    }
    
    if (!session.session) {
      console.error("[PriceService] No active session found");
      throw new Error("Authentication required");
    }

    // Check if user is admin
    const userEmail = session.session.user.email;
    if (userEmail !== "admin@hostdime.com.br") {
      console.error("[PriceService] User not authorized to save data:", userEmail);
      throw new Error("Permission denied: Only administrators can modify price data");
    }
    
    console.log("[PriceService] Saving data with authenticated admin:", userEmail);

    // First check for existing records to determine if we should update or insert
    const { data: existingData, error: fetchError } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (fetchError) {
      console.error("[PriceService] Error checking for existing price data:", fetchError);
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
      console.log("[PriceService] Updated existing record:", existingData[0].id);
    } else {
      // Insert a new record if none exists
      const { error } = await supabase
        .from(PRICE_DATA_TABLE)
        .insert({
          data: data as any, // Cast to any to bypass type checking
          updated_at: new Date().toISOString() // Convert Date to ISO string
        });
        
      saveError = error;
      console.log("[PriceService] Created new price data record");
    }

    if (saveError) {
      console.error("[PriceService] Error saving price data:", saveError);
      throw new Error(saveError.message);
    }

    // Also save in the updates table to notify other users
    await supabase
      .from('price_data_updates')
      .insert({
        type: 'update',
        details: 'Full data update by admin',
        initiator: 'admin',
        updated_at: new Date().toISOString()
      });

    console.log("[PriceService] Price data saved successfully");
    toast.success("Data saved successfully", { 
      description: "Components have been saved and synchronized." 
    });

    // Notify listeners after successful save
    notifyListeners(data);
    
    // Update the local cache timestamp to prevent unnecessary refresh prompts
    localStorage.setItem('price_data_last_fetch', new Date().toISOString());
  } catch (err: any) {
    console.error("[PriceService] Error in saveData:", err);
    if (!err.message.includes("Authentication")) {
      toast.error("Error saving data", {
        description: err.message
      });
    }
    throw new Error(err.message || "Failed to save price data.");
  }
}
