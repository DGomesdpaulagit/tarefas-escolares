import { supabase } from "@/supabase/client";
import type { CategoriaMesada, Conceito, MesadaConfig, MesadaMateria, MesadaNota } from "@/types";

export interface MesadaConfigInput {
  ano_letivo: number;
  mes_inicio?: number;
  mes_fim?: number;
  valor_mb?: number;
  valor_b?: number;
  valor_r?: number;
  valor_i?: number;
  limite_mb_por_periodo?: number;
  meta_total?: number;
}

export interface MesadaMateriaInsert {
  nome: string;
  categoria: CategoriaMesada;
  valor_base?: number | null;
  subject_id?: string | null;
  emoji?: string | null;
  cor?: string;
  ordem?: number;
}

export interface MesadaMateriaUpdate {
  nome?: string;
  categoria?: CategoriaMesada;
  valor_base?: number | null;
  subject_id?: string | null;
  emoji?: string | null;
  cor?: string;
  ativa?: boolean;
  ordem?: number;
}

export interface MesadaNotaInput {
  materia_id: string;
  ano: number;
  mes: number;
  conceito: Conceito;
  valor_calculado: number;
  observacao?: string | null;
}

export const mesadaService = {
  async getConfig(userId: string, anoLetivo: number): Promise<MesadaConfig | null> {
    const { data, error } = await supabase
      .from("mesada_config")
      .select("*")
      .eq("user_id", userId)
      .eq("ano_letivo", anoLetivo)
      .maybeSingle();

    if (error) throw error;
    return data as MesadaConfig | null;
  },

  async upsertConfig(userId: string, input: MesadaConfigInput): Promise<MesadaConfig> {
    const { data, error } = await supabase
      .from("mesada_config")
      .upsert({ user_id: userId, ...input }, { onConflict: "user_id,ano_letivo" })
      .select()
      .single();

    if (error) throw error;
    return data as MesadaConfig;
  },

  async listMaterias(userId: string): Promise<MesadaMateria[]> {
    const { data, error } = await supabase
      .from("mesada_materias")
      .select("*")
      .eq("user_id", userId)
      .order("ordem")
      .order("nome");

    if (error) throw error;
    return (data ?? []) as MesadaMateria[];
  },

  async createMateria(userId: string, input: MesadaMateriaInsert): Promise<MesadaMateria> {
    const { data, error } = await supabase
      .from("mesada_materias")
      .insert({ user_id: userId, ...input })
      .select()
      .single();

    if (error) throw error;
    return data as MesadaMateria;
  },

  async updateMateria(id: string, updates: MesadaMateriaUpdate): Promise<MesadaMateria> {
    const { data, error } = await supabase
      .from("mesada_materias")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as MesadaMateria;
  },

  async deleteMateria(id: string): Promise<void> {
    const { error } = await supabase.from("mesada_materias").delete().eq("id", id);
    if (error) throw error;
  },

  async listNotas(userId: string, ano: number): Promise<MesadaNota[]> {
    const { data, error } = await supabase
      .from("mesada_notas")
      .select("*")
      .eq("user_id", userId)
      .eq("ano", ano);

    if (error) throw error;
    return (data ?? []) as MesadaNota[];
  },

  async upsertNota(userId: string, input: MesadaNotaInput): Promise<MesadaNota> {
    const { data, error } = await supabase
      .from("mesada_notas")
      .upsert(
        { user_id: userId, ...input },
        { onConflict: "materia_id,ano,mes" },
      )
      .select()
      .single();

    if (error) throw error;
    return data as MesadaNota;
  },

  async deleteNota(id: string): Promise<void> {
    const { error } = await supabase.from("mesada_notas").delete().eq("id", id);
    if (error) throw error;
  },
};
