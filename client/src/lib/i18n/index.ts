import ptBR, { type DicionarioChave } from "./pt-BR";
import en from "./en";
import es from "./es";

export type Idioma = "pt-BR" | "en" | "es";
export type { DicionarioChave };

export const DICIONARIOS: Record<Idioma, Record<DicionarioChave, string>> = {
  "pt-BR": ptBR,
  en,
  es,
};

export const IDIOMA_PADRAO: Idioma = "pt-BR";

export function ehIdiomaValido(valor: string | null | undefined): valor is Idioma {
  return valor === "pt-BR" || valor === "en" || valor === "es";
}
