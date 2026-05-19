import { supabase } from "@/supabase/client";
import type { Tarefa } from "@/types";

type TarefaInsert = Omit<Tarefa, "id" | "created_at" | "updated_at" | "completed_at">;
type TarefaUpdate = Partial<Omit<Tarefa, "id" | "user_id" | "created_at">>;

export const taskService = {
  async list(userId: string): Promise<Tarefa[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Tarefa[];
  },

  async create(task: TarefaInsert): Promise<Tarefa> {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data as Tarefa;
  },

  async update(id: string, updates: TarefaUpdate): Promise<Tarefa> {
    const { data, error } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Tarefa;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteAll(userId: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("user_id", userId);
    if (error) throw error;
  },

  async toggle(id: string, currentStatus: Tarefa["status"]): Promise<Tarefa> {
    const isDone = currentStatus === "Concluída";
    return taskService.update(id, {
      status: isDone ? "Não iniciada" : "Concluída",
      progress: isDone ? 0 : 100,
      completed_at: isDone ? null : new Date().toISOString(),
    });
  },
};
