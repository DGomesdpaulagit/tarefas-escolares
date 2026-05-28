import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { subjectService, type SubjectInsert, type SubjectUpdate } from "@/services/subjectService";
import { useAuth } from "@/contexts/AuthContext";
import type { Materia } from "@/types";

interface DisciplinasContextValue {
  disciplinas: Materia[];
  carregando: boolean;
  recarregar: () => Promise<void>;
  criar: (input: SubjectInsert) => Promise<Materia>;
  atualizar: (id: string, input: SubjectUpdate) => Promise<Materia>;
  remover: (id: string) => Promise<void>;
  buscarPorNome: (nome: string) => Materia | undefined;
}

const DisciplinasContext = createContext<DisciplinasContextValue | null>(null);

export function DisciplinasProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [disciplinas, setDisciplinas] = useState<Materia[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      const data = await subjectService.list(user.id);
      setDisciplinas(data);
    } finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) recarregar();
    else {
      setDisciplinas([]);
      setCarregando(false);
    }
  }, [user, recarregar]);

  const criar = async (input: SubjectInsert): Promise<Materia> => {
    if (!user) throw new Error("Usuário não autenticado");
    const nova = await subjectService.create(user.id, input);
    setDisciplinas((prev) => [...prev, nova].sort((a, b) => a.name.localeCompare(b.name)));
    return nova;
  };

  const atualizar = async (id: string, input: SubjectUpdate): Promise<Materia> => {
    const atualizada = await subjectService.update(id, input);
    setDisciplinas((prev) =>
      prev.map((d) => (d.id === id ? atualizada : d)).sort((a, b) => a.name.localeCompare(b.name)),
    );
    return atualizada;
  };

  const remover = async (id: string): Promise<void> => {
    await subjectService.delete(id);
    setDisciplinas((prev) => prev.filter((d) => d.id !== id));
  };

  const buscarPorNome = (nome: string): Materia | undefined =>
    disciplinas.find((d) => d.name === nome);

  return (
    <DisciplinasContext.Provider
      value={{ disciplinas, carregando, recarregar, criar, atualizar, remover, buscarPorNome }}
    >
      {children}
    </DisciplinasContext.Provider>
  );
}

export function useDisciplinas() {
  const ctx = useContext(DisciplinasContext);
  if (!ctx) throw new Error("useDisciplinas deve ser usado dentro de DisciplinasProvider");
  return ctx;
}
