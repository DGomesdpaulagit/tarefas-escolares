// Envio de e-mail via Resend + templates HTML no visual Academic Dark.
// Usado por guardian-request-code e enviar-relatorio-responsavel.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
// Remetente. Enquanto não houver domínio próprio verificado, usar o domínio de
// teste do Resend (onboarding@resend.dev), que só entrega para o e-mail dono da
// conta — ver seção 6 da especificação v4.
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "Tarefas Escolares <onboarding@resend.dev>";

export type Idioma = "pt-BR" | "en" | "es";

export function normalizarIdioma(valor: string | null | undefined): Idioma {
  if (valor === "en" || valor === "es") return valor;
  return "pt-BR";
}

export async function enviarEmail(
  para: string,
  assunto: string,
  html: string,
): Promise<{ ok: boolean; erro?: string }> {
  if (!RESEND_API_KEY) {
    return { ok: false, erro: "RESEND_API_KEY não configurada" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to: [para], subject: assunto, html }),
    });

    if (!res.ok) {
      const detalhe = await res.text();
      return { ok: false, erro: `Resend ${res.status}: ${detalhe.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: String(e) };
  }
}

// ---------------------------------------------------------------------------
// Layout base — inline CSS (clientes de e-mail ignoram <style> externo)
// ---------------------------------------------------------------------------

function layout(titulo: string, corpo: string, rodape: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1a1d27;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 8px 32px;">
          <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#f59e0b;font-weight:700;">📚 Tarefas Escolares</div>
          <h1 style="margin:12px 0 0 0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">${titulo}</h1>
        </td></tr>
        <tr><td style="padding:16px 32px 28px 32px;color:#cbd5e1;font-size:15px;line-height:1.65;">
          ${corpo}
        </td></tr>
        <tr><td style="padding:18px 32px 26px 32px;border-top:1px solid #2a2e3d;color:#64748b;font-size:12px;line-height:1.6;">
          ${rodape}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ---------------------------------------------------------------------------
// E-mail 1 — código de verificação
// ---------------------------------------------------------------------------

type Acao = "cadastrar" | "editar" | "excluir";

const TEXTOS_CODIGO: Record<Idioma, {
  assunto: string;
  titulo: Record<Acao, string>;
  intro: (nome: string) => string;
  explica: Record<Acao, string>;
  instrucao: string;
  validade: string;
  ignorar: string;
  rodape: string;
}> = {
  "pt-BR": {
    assunto: "Seu código de verificação — Tarefas Escolares",
    titulo: {
      cadastrar: "Confirme o acompanhamento",
      editar: "Confirme a troca de e-mail",
      excluir: "Confirme o cancelamento",
    },
    intro: (nome) => `<strong>${nome}</strong> pediu o seguinte no aplicativo Tarefas Escolares:`,
    explica: {
      cadastrar: "cadastrar este e-mail para receber, todo dia 25, um relatório mensal sobre o andamento das tarefas escolares dele(a).",
      editar: "trocar o e-mail que recebe o relatório mensal por outro endereço. Como você é quem recebe hoje, a autorização é sua.",
      excluir: "parar de enviar o relatório mensal para este e-mail.",
    },
    instrucao: "Se você concorda, repasse o código abaixo para ele(a) digitar no aplicativo:",
    validade: "O código vale por 30 minutos e só pode ser usado uma vez.",
    ignorar: "Se você não reconhece este pedido, basta ignorar este e-mail — nada será alterado sem o código.",
    rodape: "Você recebeu este e-mail porque alguém informou este endereço como responsável no aplicativo Tarefas Escolares.",
  },
  en: {
    assunto: "Your verification code — Tarefas Escolares",
    titulo: {
      cadastrar: "Confirm the monthly report",
      editar: "Confirm the email change",
      excluir: "Confirm the cancellation",
    },
    intro: (nome) => `<strong>${nome}</strong> requested the following in the Tarefas Escolares app:`,
    explica: {
      cadastrar: "to register this email address to receive, on the 25th of every month, a report on their school tasks.",
      editar: "to change the email address that receives the monthly report. Since you are the current recipient, the authorization is yours.",
      excluir: "to stop sending the monthly report to this email address.",
    },
    instrucao: "If you agree, share the code below so they can type it into the app:",
    validade: "The code is valid for 30 minutes and can only be used once.",
    ignorar: "If you don't recognize this request, just ignore this email — nothing changes without the code.",
    rodape: "You received this email because someone listed this address as their guardian in the Tarefas Escolares app.",
  },
  es: {
    assunto: "Tu código de verificación — Tarefas Escolares",
    titulo: {
      cadastrar: "Confirma el seguimiento",
      editar: "Confirma el cambio de correo",
      excluir: "Confirma la cancelación",
    },
    intro: (nome) => `<strong>${nome}</strong> solicitó lo siguiente en la aplicación Tarefas Escolares:`,
    explica: {
      cadastrar: "registrar este correo para recibir, cada día 25, un informe mensual sobre sus tareas escolares.",
      editar: "cambiar el correo que recibe el informe mensual por otra dirección. Como tú eres quien lo recibe hoy, la autorización es tuya.",
      excluir: "dejar de enviar el informe mensual a este correo.",
    },
    instrucao: "Si estás de acuerdo, comparte el código de abajo para que lo escriba en la aplicación:",
    validade: "El código es válido por 30 minutos y solo se puede usar una vez.",
    ignorar: "Si no reconoces esta solicitud, ignora este correo — nada cambiará sin el código.",
    rodape: "Recibiste este correo porque alguien indicó esta dirección como responsable en la aplicación Tarefas Escolares.",
  },
};

export function htmlCodigoVerificacao(
  idioma: Idioma,
  acao: Acao,
  nomeEstudante: string,
  codigo: string,
): { assunto: string; html: string } {
  const t = TEXTOS_CODIGO[idioma];
  const corpo = `
    <p style="margin:0 0 12px 0;">${t.intro(escapar(nomeEstudante))}</p>
    <p style="margin:0 0 20px 0;">${t.explica[acao]}</p>
    <p style="margin:0 0 12px 0;">${t.instrucao}</p>
    <div style="margin:0 0 20px 0;padding:18px;background:#0f1117;border:1px solid #f59e0b;border-radius:12px;text-align:center;">
      <span style="font-size:34px;letter-spacing:10px;font-weight:700;color:#f59e0b;font-family:'Courier New',monospace;">${codigo}</span>
    </div>
    <p style="margin:0 0 8px 0;color:#94a3b8;font-size:13px;">${t.validade}</p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">${t.ignorar}</p>`;

  return { assunto: t.assunto, html: layout(t.titulo[acao], corpo, t.rodape) };
}

// ---------------------------------------------------------------------------
// E-mail 2 — relatório mensal
// ---------------------------------------------------------------------------

export type DadosRelatorio = {
  nomeEstudante: string;
  mesLabel: string;
  totalMes: number;
  concluidas: number;
  expiradas: number;
  pendentes: number;
  taxa: number;              // 0..100
  taxaAnterior: number | null;
  totalGeral: number;
  melhorDisciplina: string | null;
  disciplinaAtencao: string | null;
};

const TEXTOS_RELATORIO: Record<Idioma, {
  assunto: (nome: string, mes: string) => string;
  titulo: (mes: string) => string;
  metricas: { total: string; concluidas: string; expiradas: string; pendentes: string; taxa: string; totalGeral: string };
  frase: (d: DadosRelatorio) => string;
  comparacaoSubiu: (a: number) => string;
  comparacaoCaiu: (a: number) => string;
  comparacaoIgual: string;
  melhor: (d: string) => string;
  atencao: (d: string) => string;
  semTarefas: string;
  descadastrar: string;
  rodape: string;
}> = {
  "pt-BR": {
    assunto: (nome, mes) => `Acompanhamento de ${nome} — ${mes}`,
    titulo: (mes) => `Relatório de ${mes}`,
    metricas: {
      total: "Tarefas no mês", concluidas: "Concluídas", expiradas: "Passaram do prazo",
      pendentes: "Ainda pendentes", taxa: "Taxa de conclusão", totalGeral: "Total desde o início",
    },
    frase: (d) => `Em ${d.mesLabel}, ${escapar(d.nomeEstudante)} teve ${d.totalMes} ${d.totalMes === 1 ? "tarefa" : "tarefas"}. Concluiu ${d.concluidas} (${d.taxa}%).`,
    comparacaoSubiu: (a) => `Uma melhora em relação ao mês anterior (${a}%).`,
    comparacaoCaiu: (a) => `Uma queda em relação ao mês anterior (${a}%).`,
    comparacaoIgual: "Mesmo desempenho do mês anterior.",
    melhor: (d) => `Melhor desempenho: <strong>${escapar(d)}</strong>.`,
    atencao: (d) => `Pode valer uma conversa sobre <strong>${escapar(d)}</strong>, onde ficaram mais tarefas sem entrega.`,
    semTarefas: "Nenhuma tarefa foi registrada neste mês.",
    descadastrar: "Não quer mais receber estes relatórios? Cancelar em 1 clique",
    rodape: "Este relatório traz apenas números gerais de desempenho — nunca o conteúdo das tarefas ou anotações pessoais.",
  },
  en: {
    assunto: (nome, mes) => `${nome}'s progress — ${mes}`,
    titulo: (mes) => `${mes} report`,
    metricas: {
      total: "Tasks this month", concluidas: "Completed", expiradas: "Missed the deadline",
      pendentes: "Still pending", taxa: "Completion rate", totalGeral: "Total since the start",
    },
    frase: (d) => `In ${d.mesLabel}, ${escapar(d.nomeEstudante)} had ${d.totalMes} ${d.totalMes === 1 ? "task" : "tasks"}. Completed ${d.concluidas} (${d.taxa}%).`,
    comparacaoSubiu: (a) => `An improvement over last month (${a}%).`,
    comparacaoCaiu: (a) => `A drop compared to last month (${a}%).`,
    comparacaoIgual: "Same performance as last month.",
    melhor: (d) => `Best performance: <strong>${escapar(d)}</strong>.`,
    atencao: (d) => `It may be worth talking about <strong>${escapar(d)}</strong>, where most tasks were left undone.`,
    semTarefas: "No tasks were recorded this month.",
    descadastrar: "Don't want these reports anymore? Unsubscribe in 1 click",
    rodape: "This report contains only overall performance numbers — never task contents or personal notes.",
  },
  es: {
    assunto: (nome, mes) => `Seguimiento de ${nome} — ${mes}`,
    titulo: (mes) => `Informe de ${mes}`,
    metricas: {
      total: "Tareas del mes", concluidas: "Completadas", expiradas: "Fuera de plazo",
      pendentes: "Aún pendientes", taxa: "Tasa de finalización", totalGeral: "Total desde el inicio",
    },
    frase: (d) => `En ${d.mesLabel}, ${escapar(d.nomeEstudante)} tuvo ${d.totalMes} ${d.totalMes === 1 ? "tarea" : "tareas"}. Completó ${d.concluidas} (${d.taxa}%).`,
    comparacaoSubiu: (a) => `Una mejora respecto al mes anterior (${a}%).`,
    comparacaoCaiu: (a) => `Una caída respecto al mes anterior (${a}%).`,
    comparacaoIgual: "El mismo rendimiento que el mes anterior.",
    melhor: (d) => `Mejor rendimiento: <strong>${escapar(d)}</strong>.`,
    atencao: (d) => `Puede valer la pena hablar sobre <strong>${escapar(d)}</strong>, donde quedaron más tareas sin entregar.`,
    semTarefas: "No se registraron tareas este mes.",
    descadastrar: "¿Ya no quieres recibir estos informes? Cancelar con 1 clic",
    rodape: "Este informe solo trae números generales de rendimiento — nunca el contenido de las tareas ni anotaciones personales.",
  },
};

function metrica(label: string, valor: string, cor: string): string {
  return `<td style="padding:12px;background:#0f1117;border-radius:12px;text-align:center;width:33%;">
    <div style="font-size:24px;font-weight:700;color:${cor};">${valor}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:4px;line-height:1.3;">${label}</div>
  </td>`;
}

export function htmlRelatorioMensal(
  idioma: Idioma,
  d: DadosRelatorio,
  linkDescadastro: string,
): { assunto: string; html: string } {
  const t = TEXTOS_RELATORIO[idioma];

  let texto: string;
  if (d.totalMes === 0) {
    texto = t.semTarefas;
  } else {
    const partes = [t.frase(d)];
    if (d.taxaAnterior !== null) {
      if (d.taxa > d.taxaAnterior) partes.push(t.comparacaoSubiu(d.taxaAnterior));
      else if (d.taxa < d.taxaAnterior) partes.push(t.comparacaoCaiu(d.taxaAnterior));
      else partes.push(t.comparacaoIgual);
    }
    if (d.melhorDisciplina) partes.push(t.melhor(d.melhorDisciplina));
    if (d.disciplinaAtencao) partes.push(t.atencao(d.disciplinaAtencao));
    texto = partes.join(" ");
  }

  const corpo = `
    <p style="margin:0 0 22px 0;font-size:16px;line-height:1.7;color:#e2e8f0;">${texto}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="6" style="margin:0 0 6px 0;">
      <tr>
        ${metrica(t.metricas.total, String(d.totalMes), "#ffffff")}
        ${metrica(t.metricas.concluidas, String(d.concluidas), "#10b981")}
        ${metrica(t.metricas.expiradas, String(d.expiradas), "#ef4444")}
      </tr>
      <tr>
        ${metrica(t.metricas.pendentes, String(d.pendentes), "#f59e0b")}
        ${metrica(t.metricas.taxa, `${d.taxa}%`, "#f59e0b")}
        ${metrica(t.metricas.totalGeral, String(d.totalGeral), "#94a3b8")}
      </tr>
    </table>`;

  const rodape = `${t.rodape}<br><br>
    <a href="${linkDescadastro}" style="color:#64748b;text-decoration:underline;">${t.descadastrar}</a>`;

  return {
    assunto: t.assunto(d.nomeEstudante, d.mesLabel),
    html: layout(t.titulo(d.mesLabel), corpo, rodape),
  };
}

// ---------------------------------------------------------------------------

/** Escapa HTML — nome do estudante e da disciplina vêm de input do usuário. */
export function escapar(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const MESES: Record<Idioma, string[]> = {
  "pt-BR": ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};
