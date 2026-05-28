import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { taskService } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";
import { diasAteVencimento, isExpirada, getStatusEfetivo } from "@/lib/tarefasData";
import type { Tarefa, FiltrosTarefas, MetricasTarefas, PrioridadeTarefa, StatusTarefa } from "@/types";

type TarefaInsert = Omit<Tarefa, "id" | "created_at" | "updated_at" | "completed_at">;
type TarefaUpdate = Partial<Omit<Tarefa, "id" | "user_id" | "created_at">>;

interface TarefasContextValue {
  tarefas: Tarefa[];
  carregando: boolean;
  filtros: FiltrosTarefas;
  tarefasFiltradas: Tarefa[];
  setFiltros: (f: Partial<FiltrosTarefas>) => void;
  adicionarTarefa: (t: Omit<TarefaInsert, "user_id">) => Promise<void>;
  atualizarTarefa: (id: string, t: TarefaUpdate) => Promise<void>;
  removerTarefa: (id: string) => Promise<void>;
  toggleConcluida: (id: string) => Promise<void>;
  limparTodas: () => Promise<void>;
  recarregar: () => Promise<void>;
  metricas: MetricasTarefas;
}

const TarefasContext = createContext<TarefasContextValue | null>(null);

function calcularDiasRestantes(dueDate: string | null): number | null {
  return diasAteVencimento(dueDate);
}

function isUrgente(tarefa: Tarefa): boolean {
  const status = getStatusEfetivo(tarefa);
  if (status === "Concluída" || status === "Passou do Prazo") return false;
  const dias = calcularDiasRestantes(tarefa.due_date);
  return dias !== null && dias >= 0 && dias <= 3;
}

export function TarefasProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltrosState] = useState<FiltrosTarefas>({
    busca: "",
    status: "Todas",
    materia: "Todas",
    prioridade: "Todas",
  });

  const recarregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      const data = await taskService.list(user.id);
      setTarefas(data);

      // Persiste em background o status "Passou do Prazo" para tarefas que
      // expiraram desde a última visita — sem bloquear a UI.
      const aExpirar = data.filter(
        (t) => t.status !== "Concluída" && t.status !== "Passou do Prazo" && isExpirada(t),
      );
      if (aExpirar.length > 0) {
        Promise.all(
          aExpirar.map((t) =>
            taskService.update(t.id, { status: "Passou do Prazo" }).catch(() => null),
          ),
        ).then((res) => {
          const atualizadas = res.filter((r): r is Tarefa => r !== null);
          if (atualizadas.length === 0) return;
          setTarefas((prev) =>
            prev.map((t) => atualizadas.find((u) => u.id === t.id) ?? t),
          );
        });
      }
    } finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      recarregar();
    } else {
      setTarefas([]);
      setCarregando(false);
    }
  }, [user, recarregar]);

  const setFiltros = (f: Partial<FiltrosTarefas>) => {
    setFiltrosState((prev) => ({ ...prev, ...f }));
  };

  // Urgentes primeiro, depois por data de entrega
  const tarefasFiltradas = tarefas
    .filter((t) => {
      if (filtros.busca) {
        const q = filtros.busca.toLowerCase();
        const campos = [t.title, t.subject_name, t.notes, t.sector, t.origin, t.description];
        if (!campos.some((c) => c?.toLowerCase().includes(q))) return false;
      }
      if (filtros.status !== "Todas" && t.status !== filtros.status) return false;
      if (filtros.materia !== "Todas" && t.subject_name !== filtros.materia) return false;
      if (filtros.prioridade !== "Todas" && t.priority !== filtros.prioridade) return false;
      return true;
    })
    .sort((a, b) => {
      // Bucket: 0 = pendente urgente, 1 = pendente normal, 2 = concluída, 3 = expirada
      const bucket = (t: Tarefa): number => {
        const eff = getStatusEfetivo(t);
        if (eff === "Passou do Prazo") return 3;
        if (eff === "Concluída") return 2;
        return isUrgente(t) ? 0 : 1;
      };
      const ba = bucket(a);
      const bb = bucket(b);
      if (ba !== bb) return ba - bb;
      // Dentro do mesmo bucket: prazo mais próximo primeiro (ou criação mais recente quando sem prazo)
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const adicionarTarefa = async (t: Omit<TarefaInsert, "user_id">) => {
    if (!user) throw new Error("Usuário não autenticado");
    const nova = await taskService.create({ ...t, user_id: user.id });
    setTarefas((prev) => [nova, ...prev]);
  };

  const atualizarTarefa = async (id: string, dados: TarefaUpdate) => {
    const atualizada = await taskService.update(id, dados);
    setTarefas((prev) => prev.map((t) => (t.id === id ? atualizada : t)));
  };

  const removerTarefa = async (id: string) => {
    await taskService.delete(id);
    setTarefas((prev) => prev.filter((t) => t.id !== id));
  };

  const limparTodas = async () => {
    if (!user) throw new Error("Usuário não autenticado");
    await taskService.deleteAll(user.id);
    setTarefas([]);
  };

  const toggleConcluida = async (id: string) => {
    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa) return;
    // Tarefa expirada não pode ser concluída — apenas editada.
    if (getStatusEfetivo(tarefa) === "Passou do Prazo") return;
    const atualizada = await taskService.toggle(id, tarefa.status);
    setTarefas((prev) => prev.map((t) => (t.id === id ? atualizada : t)));
  };

  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => getStatusEfetivo(t) === "Concluída").length;
  const emAndamento = tarefas.filter((t) => getStatusEfetivo(t) === "Em Andamento").length;
  const passouPrazo = tarefas.filter((t) => getStatusEfetivo(t) === "Passou do Prazo").length;
  const pendentes = tarefas.filter((t) => getStatusEfetivo(t) === "Não iniciada").length;
  const percentualConcluido = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const porMateria: Record<string, number> = {};
  const porStatus: Record<string, number> = {};
  const porSetor: Record<string, number> = {};
  tarefas.forEach((t) => {
    const eff = getStatusEfetivo(t);
    porMateria[t.subject_name] = (porMateria[t.subject_name] ?? 0) + 1;
    porStatus[eff] = (porStatus[eff] ?? 0) + 1;
    if (t.sector) porSetor[t.sector] = (porSetor[t.sector] ?? 0) + 1;
  });

  return (
    <TarefasContext.Provider
      value={{
        tarefas,
        carregando,
        filtros,
        tarefasFiltradas,
        setFiltros,
        adicionarTarefa,
        atualizarTarefa,
        removerTarefa,
        toggleConcluida,
        limparTodas,
        recarregar,
        metricas: {
          total,
          concluidas,
          pendentes,
          emAndamento,
          passouPrazo,
          percentualConcluido,
          porMateria,
          porStatus,
          porSetor,
        },
      }}
    >
      {children}
    </TarefasContext.Provider>
  );
}

export function useTarefas() {
  const ctx = useContext(TarefasContext);
  if (!ctx) throw new Error("useTarefas deve ser usado dentro de TarefasProvider");
  return ctx;
}

export { calcularDiasRestantes, isUrgente };
export type { PrioridadeTarefa, StatusTarefa };
