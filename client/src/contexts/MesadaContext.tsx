import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  mesadaService,
  type MesadaConfigInput,
  type MesadaMateriaInsert,
  type MesadaMateriaUpdate,
} from "@/services/mesadaService";
import { useAuth } from "@/contexts/AuthContext";
import type { Conceito, MesadaConfig, MesadaMateria, MesadaNota } from "@/types";

interface MesadaContextValue {
  config: MesadaConfig | null;
  materias: MesadaMateria[];
  notas: MesadaNota[];
  carregando: boolean;
  anoLetivo: number;

  recarregar: () => Promise<void>;
  atualizarConfig: (input: Partial<MesadaConfigInput>) => Promise<void>;
  criarMateria: (input: MesadaMateriaInsert) => Promise<MesadaMateria>;
  atualizarMateria: (id: string, input: MesadaMateriaUpdate) => Promise<void>;
  removerMateria: (id: string) => Promise<void>;
  lancarNota: (
    materiaId: string,
    mes: number,
    conceito: Conceito,
    observacao?: string | null,
  ) => Promise<{ nota: MesadaNota; limiteMbAtingido: boolean }>;
  removerNota: (id: string) => Promise<void>;

  notaDoMes: (materiaId: string, mes: number) => MesadaNota | undefined;
  valorDoMes: (mes: number) => number;
  mbUsadosNoPeriodo: number;
  valorAcumulado: number;
  progressoPercentual: number;
}

const MesadaContext = createContext<MesadaContextValue | null>(null);

function valorBaseConceito(config: MesadaConfig, conceito: Conceito): number {
  switch (conceito) {
    case "MB":
      return config.valor_mb;
    case "B":
      return config.valor_b;
    case "R":
      return config.valor_r;
    case "I":
      return config.valor_i;
  }
}

export function MesadaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const anoLetivo = new Date().getFullYear();

  const [config, setConfig] = useState<MesadaConfig | null>(null);
  const [materias, setMaterias] = useState<MesadaMateria[]>([]);
  const [notas, setNotas] = useState<MesadaNota[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      let cfg = await mesadaService.getConfig(user.id, anoLetivo);
      if (!cfg) {
        cfg = await mesadaService.upsertConfig(user.id, { ano_letivo: anoLetivo });
      }
      const [mats, nts] = await Promise.all([
        mesadaService.listMaterias(user.id),
        mesadaService.listNotas(user.id, anoLetivo),
      ]);
      setConfig(cfg);
      setMaterias(mats);
      setNotas(nts);
    } finally {
      setCarregando(false);
    }
  }, [user, anoLetivo]);

  useEffect(() => {
    if (user) recarregar();
    else {
      setConfig(null);
      setMaterias([]);
      setNotas([]);
      setCarregando(false);
    }
  }, [user, recarregar]);

  const atualizarConfig = async (input: Partial<MesadaConfigInput>): Promise<void> => {
    if (!user) throw new Error("Usuário não autenticado");
    const atualizado = await mesadaService.upsertConfig(user.id, { ano_letivo: anoLetivo, ...input });
    setConfig(atualizado);
  };

  const criarMateria = async (input: MesadaMateriaInsert): Promise<MesadaMateria> => {
    if (!user) throw new Error("Usuário não autenticado");
    const nova = await mesadaService.createMateria(user.id, input);
    setMaterias((prev) => [...prev, nova].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)));
    return nova;
  };

  const atualizarMateria = async (id: string, input: MesadaMateriaUpdate): Promise<void> => {
    const atualizada = await mesadaService.updateMateria(id, input);
    setMaterias((prev) => prev.map((m) => (m.id === id ? atualizada : m)));
  };

  const removerMateria = async (id: string): Promise<void> => {
    await mesadaService.deleteMateria(id);
    setMaterias((prev) => prev.filter((m) => m.id !== id));
    setNotas((prev) => prev.filter((n) => n.materia_id !== id));
  };

  // Ordem determinística das matérias no período, para decidir quais MBs contam primeiro no limite
  const ordemMaterias = useMemo(() => {
    const map: Record<string, number> = {};
    materias.forEach((m, i) => {
      map[m.id] = m.ordem ?? i;
    });
    return map;
  }, [materias]);

  const lancarNota = async (
    materiaId: string,
    mes: number,
    conceito: Conceito,
    observacao?: string | null,
  ): Promise<{ nota: MesadaNota; limiteMbAtingido: boolean }> => {
    if (!user || !config) throw new Error("Configuração da mesada não carregada");

    let valorFinal = valorBaseConceito(config, conceito);
    let limiteMbAtingido = false;

    if (conceito === "MB") {
      // Notas MB de outras matérias/meses no período (excluindo o lançamento atual, caso já exista)
      const outrasMb = notas.filter(
        (n) => n.conceito === "MB" && !(n.materia_id === materiaId && n.mes === mes),
      );
      // Ordem determinística: mês crescente, depois ordem da matéria
      outrasMb.sort((a, b) => a.mes - b.mes || (ordemMaterias[a.materia_id] ?? 0) - (ordemMaterias[b.materia_id] ?? 0));

      const posicaoDoNovo = outrasMb.filter(
        (n) => n.mes < mes || (n.mes === mes && (ordemMaterias[n.materia_id] ?? 0) < (ordemMaterias[materiaId] ?? 0)),
      ).length;

      if (posicaoDoNovo >= config.limite_mb_por_periodo) {
        valorFinal = config.valor_b;
        limiteMbAtingido = true;
      }
    }

    const nota = await mesadaService.upsertNota(user.id, {
      materia_id: materiaId,
      ano: anoLetivo,
      mes,
      conceito,
      valor_calculado: valorFinal,
      observacao: observacao ?? null,
    });

    setNotas((prev) => {
      const semAntiga = prev.filter((n) => !(n.materia_id === materiaId && n.mes === mes));
      return [...semAntiga, nota];
    });

    return { nota, limiteMbAtingido };
  };

  const removerNota = async (id: string): Promise<void> => {
    await mesadaService.deleteNota(id);
    setNotas((prev) => prev.filter((n) => n.id !== id));
  };

  const notaDoMes = (materiaId: string, mes: number): MesadaNota | undefined =>
    notas.find((n) => n.materia_id === materiaId && n.mes === mes);

  const valorDoMes = (mes: number): number =>
    notas.filter((n) => n.mes === mes).reduce((soma, n) => soma + n.valor_calculado, 0);

  const mbUsadosNoPeriodo = useMemo(() => notas.filter((n) => n.conceito === "MB").length, [notas]);

  const valorAcumulado = useMemo(
    () => notas.reduce((soma, n) => soma + n.valor_calculado, 0),
    [notas],
  );

  const progressoPercentual = useMemo(() => {
    if (!config || config.meta_total <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((valorAcumulado / config.meta_total) * 100)));
  }, [config, valorAcumulado]);

  return (
    <MesadaContext.Provider
      value={{
        config,
        materias,
        notas,
        carregando,
        anoLetivo,
        recarregar,
        atualizarConfig,
        criarMateria,
        atualizarMateria,
        removerMateria,
        lancarNota,
        removerNota,
        notaDoMes,
        valorDoMes,
        mbUsadosNoPeriodo,
        valorAcumulado,
        progressoPercentual,
      }}
    >
      {children}
    </MesadaContext.Provider>
  );
}

export function useMesada() {
  const ctx = useContext(MesadaContext);
  if (!ctx) throw new Error("useMesada deve ser usado dentro de MesadaProvider");
  return ctx;
}
