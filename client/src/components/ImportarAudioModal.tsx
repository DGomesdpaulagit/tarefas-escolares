import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Mic, Square, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIdioma } from "@/contexts/LanguageContext";
import { audioImportService, ErroImportarAudio } from "@/services/audioImportService";
import RevisaoCandidatasTarefas from "@/components/RevisaoCandidatasTarefas";
import type { CandidataComId } from "@/lib/candidataTarefa";
import type { DicionarioChave } from "@/lib/i18n";

interface ImportarAudioModalProps {
  onClose: () => void;
}

type Status = "idle" | "gravando" | "enviando" | "analisando" | "preview" | "error";

const DURACAO_MAX_SEGUNDOS = 90;

function escolherMimeType(): { mimeType: string; extensao: string } {
  const candidatos: [string, string][] = [
    ["audio/webm", "webm"],
    ["audio/mp4", "m4a"],
    ["audio/ogg", "ogg"],
  ];
  for (const [mimeType, extensao] of candidatos) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mimeType)) {
      return { mimeType, extensao };
    }
  }
  return { mimeType: "", extensao: "webm" };
}

export default function ImportarAudioModal({ onClose }: ImportarAudioModalProps) {
  const { user } = useAuth();
  const { t } = useIdioma();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [segundosGravados, setSegundosGravados] = useState(0);
  const [candidatas, setCandidatas] = useState<CandidataComId[]>([]);
  const [restantesHoje, setRestantesHoje] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [arquivoInfo, setArquivoInfo] = useState({ nome: "audio", tamanho: 0 });

  useEffect(() => () => pararStream(), []);

  const pararStream = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const traduzErro = (codigo: string): string => {
    const chave = `importarIA.erro.${codigo}` as DicionarioChave;
    const texto = t(chave);
    return texto !== chave ? texto : t("importarIA.erro.generico");
  };

  const processarBlob = async (blob: Blob, nomeArquivo: string, extensao: string) => {
    if (!user) return;
    setStatus("enviando");
    setArquivoInfo({ nome: nomeArquivo, tamanho: blob.size });
    let path: string | null = null;
    try {
      path = await audioImportService.upload(user.id, blob, extensao);
      setStatus("analisando");
      const resultado = await audioImportService.analisar(path);
      setCandidatas(resultado.tarefas.map((c) => ({ ...c, localId: crypto.randomUUID() })));
      setRestantesHoje(resultado.restantesHoje);
      setStatus("preview");
    } catch (err) {
      const codigo = err instanceof ErroImportarAudio ? err.codigo : "generico";
      setErro(traduzErro(codigo));
      setStatus("error");
    } finally {
      if (path) audioImportService.apagar(path);
    }
  };

  const iniciarGravacao = async () => {
    setErro("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const { mimeType, extensao } = escolherMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        pararStream();
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        processarBlob(blob, `gravacao.${extensao}`, extensao);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setSegundosGravados(0);
      setStatus("gravando");

      intervalRef.current = setInterval(() => {
        setSegundosGravados((s) => {
          if (s + 1 >= DURACAO_MAX_SEGUNDOS) {
            pararGravacao();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setErro(t("importarAudio.erroPermissaoMicrofone"));
      setStatus("error");
    }
  };

  const pararGravacao = () => {
    mediaRecorderRef.current?.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleFileSelect = (file: File) => {
    const extensao = file.name.split(".").pop() ?? "mp3";
    processarBlob(file, file.name, extensao);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t("importarAudio.titulo")}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">{t("importarAudio.titulo")}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500" aria-label={t("importarAudio.fechar")}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {status === "idle" && (
            <div className="text-center space-y-5">
              <p className="text-slate-300 text-sm">{t("importarAudio.instrucao")}</p>

              <button
                onClick={iniciarGravacao}
                className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center mx-auto transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-card)]"
                aria-label={t("importarAudio.btnGravar")}
              >
                <Mic size={28} className="text-black" />
              </button>
              <p className="text-xs text-slate-500">{t("importarAudio.duracaoMaxima")}</p>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500">{t("importarAudio.ouEnviarArquivo")}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                className="hidden"
                aria-label={t("importarAudio.selecionarArquivo")}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-white/10 bg-transparent text-slate-300 hover:bg-white/10 gap-2"
              >
                <Upload size={14} />
                {t("importarAudio.selecionarArquivo")}
              </Button>
            </div>
          )}

          {status === "gravando" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 rounded-full bg-red-500" />
              </div>
              <p className="text-slate-300 font-medium">
                {t("importarAudio.gravando")} {String(Math.floor(segundosGravados / 60)).padStart(2, "0")}:{String(segundosGravados % 60).padStart(2, "0")}
              </p>
              <Button
                onClick={pararGravacao}
                className="bg-red-500 hover:bg-red-400 text-white font-semibold gap-2"
              >
                <Square size={14} />
                {t("importarAudio.btnParar")}
              </Button>
            </div>
          )}

          {(status === "enviando" || status === "analisando") && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="text-amber-400 animate-spin mb-3" aria-hidden="true" />
              <p className="text-slate-300 font-medium">
                {status === "enviando" ? t("importarAudio.enviando") : t("importarAudio.analisando")}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-300">{erro}</p>
              </div>
            </div>
          )}

          {status === "preview" && (
            <RevisaoCandidatasTarefas
              candidatas={candidatas}
              setCandidatas={setCandidatas}
              restantesHoje={restantesHoje}
              nomeArquivo={arquivoInfo.nome}
              tamanhoArquivo={arquivoInfo.tamanho}
              tipoArquivo="audio"
              onFechar={onClose}
              onTentarNovamente={() => setStatus("idle")}
              textoTentarNovamente={t("importarAudio.btnTentarNovamente")}
            />
          )}
        </div>

        {status === "error" && (
          <div className="flex gap-3 px-6 py-4 border-t border-white/10 bg-[var(--bg-base)]/50">
            <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white bg-transparent">
              {t("importarAudio.fechar")}
            </Button>
            <Button onClick={() => setStatus("idle")} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
              {t("importarAudio.btnTentarNovamente")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
