import { supabase } from "@/supabase/client";
import type { ArquivoImportado } from "@/types";

export const importService = {
  async list(userId: string): Promise<ArquivoImportado[]> {
    const { data, error } = await supabase
      .from("imports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as ArquivoImportado[];
  },

  async create(
    userId: string,
    fileName: string,
    fileSize: number,
    importedCount: number,
    fileType: string
  ): Promise<ArquivoImportado> {
    const { data, error } = await supabase
      .from("imports")
      .insert({
        user_id: userId,
        file_name: fileName,
        file_size: fileSize,
        imported_count: importedCount,
        file_type: fileType,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ArquivoImportado;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("imports").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteAll(userId: string): Promise<void> {
    const { error } = await supabase.from("imports").delete().eq("user_id", userId);
    if (error) throw error;
  },
};
