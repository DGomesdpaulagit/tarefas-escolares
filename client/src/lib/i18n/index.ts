import ptBR, { type DicionarioChave, calendarioPtBR } from "./pt-BR";
import en, { calendarioEn } from "./en";
import es, { calendarioEs } from "./es";

export type Idioma = "pt-BR" | "en" | "es";
export type { DicionarioChave };

export const DICIONARIOS: Record<Idioma, Record<DicionarioChave, string>> = {
  "pt-BR": ptBR,
  en,
  es,
};

export const CALENDARIO: Record<Idioma, { diasCurtos: string[]; mesesCurtos: string[]; mesesCompletos: string[] }> = {
  "pt-BR": calendarioPtBR,
  en: calendarioEn,
  es: calendarioEs,
};

export const IDIOMA_PADRAO: Idioma = "pt-BR";

export function ehIdiomaValido(valor: string | null | undefined): valor is Idioma {
  return valor === "pt-BR" || valor === "en" || valor === "es";
}
