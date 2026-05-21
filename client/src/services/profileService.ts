import { supabase } from "@/supabase/client";
import type { Perfil } from "@/types";

export const profileService = {
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  },

  async get(userId: string): Promise<Perfil | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) return null;
    return data as Perfil | null;
  },

  async update(userId: string, updates: Partial<Perfil>): Promise<Perfil> {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
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
