import React, { createContext, useContext, useState, useCallback } from "react";
import { DICIONARIOS, IDIOMA_PADRAO, ehIdiomaValido, type Idioma, type DicionarioChave } from "@/lib/i18n";

interface LanguageContextValue {
  idioma: Idioma;
  setIdioma: (i: Idioma) => void;
  t: (chave: DicionarioChave) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [idioma, setIdiomaState] = useState<Idioma>(() => {
    const salvo = localStorage.getItem("tarefas_idioma");
    return ehIdiomaValido(salvo) ? salvo : IDIOMA_PADRAO;
  });

  const setIdioma = useCallback((novo: Idioma) => {
    setIdiomaState(novo);
    localStorage.setItem("tarefas_idioma", novo);
  }, []);

  const t = useCallback(
    (chave: DicionarioChave): string => DICIONARIOS[idioma][chave] ?? DICIONARIOS[IDIOMA_PADRAO][chave] ?? chave,
    [idioma],
  );

  return <LanguageContext.Provider value={{ idioma, setIdioma, t }}>{children}</LanguageContext.Provider>;
}

export function useIdioma() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useIdioma deve ser usado dentro de LanguageProvider");
  return ctx;
}
