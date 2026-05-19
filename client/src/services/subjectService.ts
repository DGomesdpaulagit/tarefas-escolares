import { supabase } from "@/supabase/client";
import type { Materia } from "@/types";

export const subjectService = {
  async list(userId: string): Promise<Materia[]> {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (error) throw error;
    return (data ?? []) as Materia[];
  },

  async create(userId: string, name: string, color: string): Promise<Materia> {
    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: userId, name, color })
      .select()
      .single();

    if (error) throw error;
    return data as Materia;
  },

  async update(id: string, updates: { name?: string; color?: string }): Promise<Materia> {
    const { data, error } = await supabase
      .from("subjects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Materia;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) throw error;
  },
};
