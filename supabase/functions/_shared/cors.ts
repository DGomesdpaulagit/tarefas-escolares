export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/** Mascara o e-mail para exibir na UI sem revelar o endereço inteiro. */
export function mascararEmail(email: string): string {
  const [local, dominio] = email.split("@");
  if (!dominio) return "***";
  const visivel = local.slice(0, 1);
  return `${visivel}${"*".repeat(Math.max(local.length - 1, 2))}@${dominio}`;
}

/** SHA-256 em hex — usado para guardar o código sem texto puro. */
export async function hashCodigo(codigo: string): Promise<string> {
  const bytes = new TextEncoder().encode(codigo);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 6 dígitos aleatórios criptograficamente seguros. */
export function gerarCodigo(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
