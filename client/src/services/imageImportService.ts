import { supabase } from "@/supabase/client";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export type CandidataTarefa = {
  title: string;
  subject_name: string | null;
  due_date: string | null;
  priority: "Alta" | "Média" | "Baixa";
  confianca: number;
  camposFaltando: ("data" | "disciplina" | "titulo")[];
};

export class ErroImportarImagem extends Error {
  constructor(public codigo: string) {
    super(codigo);
    this.name = "ErroImportarImagem";
  }
}

export const imageImportService = {
  /** Envia a imagem para o Storage, na pasta privada do usuário. */
  async upload(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("task-images").upload(path, file);
    if (error) throw new ErroImportarImagem("falha_no_upload");
    return path;
  },

  /** Chama a Edge Function que analisa a imagem já enviada. */
  async analisar(path: string): Promise<{ tarefas: CandidataTarefa[]; restantesHoje: number }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new ErroImportarImagem("nao_autenticado");

    const res = await fetch(`${FUNCTIONS_URL}/analisar-imagem-tarefas`, {
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
      throw new ErroImportarImagem("resposta_invalida");
    }

    if (!res.ok) throw new ErroImportarImagem(String(payload.erro ?? "erro_desconhecido"));
    return payload as { tarefas: CandidataTarefa[]; restantesHoje: number };
  },

  /**
   * Apaga a foto do Storage assim que a análise termina — o app não precisa
   * guardar a imagem original depois de extrair as tarefas dela.
   */
  async apagar(path: string): Promise<void> {
    await supabase.storage.from("task-images").remove([path]).catch(() => null);
  },
};
