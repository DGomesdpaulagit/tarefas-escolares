import { supabase } from "@/supabase/client";
import type { Materia } from "@/types";

export interface SubjectInsert {
  name: string;
  color: string;
  emoji?: string | null;
}

export interface SubjectUpdate {
  name?: string;
  color?: string;
  emoji?: string | null;
}

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

  async create(userId: string, input: SubjectInsert): Promise<Materia> {
    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: userId, name: input.name, color: input.color, emoji: input.emoji ?? null })
      .select()
      .single();

    if (error) throw error;
    return data as Materia;
  },

  async update(id: string, updates: SubjectUpdate): Promise<Materia> {
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
