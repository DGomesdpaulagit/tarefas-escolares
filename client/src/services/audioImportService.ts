import { supabase } from "@/supabase/client";
import type { CandidataTarefa } from "@/lib/candidataTarefa";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export class ErroImportarAudio extends Error {
  constructor(public codigo: string) {
    super(codigo);
    this.name = "ErroImportarAudio";
  }
}

export const audioImportService = {
  /** Envia o áudio para o Storage, na pasta privada do usuário. */
  async upload(userId: string, blob: Blob, extensao: string): Promise<string> {
    const path = `${userId}/${crypto.randomUUID()}.${extensao}`;
    const { error } = await supabase.storage.from("task-audio").upload(path, blob, {
      contentType: blob.type || "audio/webm",
    });
    if (error) throw new ErroImportarAudio("falha_no_upload");
    return path;
  },

  /** Chama a Edge Function que analisa o áudio já enviado. */
  async analisar(path: string): Promise<{ tarefas: CandidataTarefa[]; restantesHoje: number }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new ErroImportarAudio("nao_autenticado");

    const res = await fetch(`${FUNCTIONS_URL}/analisar-audio-tarefas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": ANON_KEY,
      },
      body: JSON.stringify({ path }),
    });

    let payload: Record<string, unknown>;
    try {
      payload = await res.json();
    } catch {
      throw new ErroImportarAudio("resposta_invalida");
    }

    if (!res.ok) throw new ErroImportarAudio(String(payload.erro ?? "erro_desconhecido"));
    return payload as { tarefas: CandidataTarefa[]; restantesHoje: number };
  },

  /** Apaga o áudio do Storage assim que a análise termina. */
  async apagar(path: string): Promise<void> {
    await supabase.storage.from("task-audio").remove([path]).catch(() => null);
  },
};
