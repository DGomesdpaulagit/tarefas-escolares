import { supabase } from "@/supabase/client";
import type { Perfil } from "@/types";

export const profileService = {
  async get(userId: string): Promise<Perfil | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data as Perfil;
  },

  async update(userId: string, updates: Partial<Perfil>): Promise<Perfil> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as Perfil;
  },

  async upsert(profile: Partial<Perfil> & { id: string }): Promise<void> {
    const { error } = await supabase.from("profiles").upsert(profile);
    if (error) throw error;
  },
};
