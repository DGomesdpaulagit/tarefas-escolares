import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { importService } from "@/services/importService";
import { useAuth } from "@/contexts/AuthContext";
import type { ArquivoImportado } from "@/types";

interface ArquivosContextType {
  arquivos: ArquivoImportado[];
  carregando: boolean;
  adicionarArquivo: (
    fileName: string,
    fileSize: number,
    importedCount: number,
    fileType: string
  ) => Promise<void>;
  removerArquivo: (id: string) => Promise<void>;
  limparHistorico: () => Promise<void>;
}

const ArquivosContext = createContext<ArquivosContextType | undefined>(undefined);

export function ArquivosProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [arquivos, setArquivos] = useState<ArquivoImportado[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      const data = await importService.list(user.id);
      setArquivos(data);
    } finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      recarregar();
    } else {
      setArquivos([]);
      setCarregando(false);
    }
  }, [user, recarregar]);

  const adicionarArquivo = async (
    fileName: string,
    fileSize: number,
    importedCount: number,
    fileType: string
  ) => {
    if (!user) throw new Error("Usuário não autenticado");
    const novo = await importService.create(user.id, fileName, fileSize, importedCount, fileType);
    setArquivos((prev) => [novo, ...prev]);
  };

  const removerArquivo = async (id: string) => {
    await importService.delete(id);
    setArquivos((prev) => prev.filter((a) => a.id !== id));
  };

  const limparHistorico = async () => {
    if (!user) throw new Error("Usuário não autenticado");
    await importService.deleteAll(user.id);
    setArquivos([]);
  };

  return (
    <ArquivosContext.Provider
      value={{ arquivos, carregando, adicionarArquivo, removerArquivo, limparHistorico }}
    >
      {children}
    </ArquivosContext.Provider>
  );
}

export function useArquivos() {
  const context = useContext(ArquivosContext);
  if (context === undefined) {
    throw new Error("useArquivos deve ser usado dentro de ArquivosProvider");
  }
  return context;
}
