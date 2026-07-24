import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import React from "react";
import { Camera, Loader2, Save, User, Bell, Palette, GraduationCap, Languages, Check, HelpCircle, MailCheck } from "lucide-react";
import ResponsavelPainel from "@/components/ResponsavelPainel";
import type { Perfil } from "@/types";
import { settingsService } from "@/services/settingsService";
import { soundService } from "@/services/soundService";
import { notificationService } from "@/services/notificationService";
import { useTheme } from "@/contexts/ThemeContext";
import { useTour } from "@/contexts/TourContext";
import { useIdioma } from "@/contexts/LanguageContext";
import { ehIdiomaValido } from "@/lib/i18n";

type Aba = "perfil" | "academico" | "tema" | "notificacoes" | "responsavel";

const ANOS_ESCOLARES = [
  "6º Ano",
  "7º Ano",
  "8º Ano",
  "9º Ano",
  "1º Ano - Ensino Médio",
  "2º Ano - Ensino Médio",
  "3º Ano - Ensino Médio",
  "1º Ano - Técnico",
  "2º Ano - Técnico",
  "3º Ano - Técnico",
  "Graduação",
  "Pós-graduação",
  "Outro",
];

const IDIOMAS = [
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

function compressImage(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas não suportado"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Imagem inválida")); };
    img.src = url;
  });
}

export default function Configuracoes() {
  const { user, deslogar, atualizarSenha } = useAuth();
  const { iniciar: iniciarTour } = useTour();
  const { t } = useIdioma();
  const [abaAtiva, setAbaAtiva] = useState<Aba>("perfil");

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">{t("config.titulo")}</h1>
        <p className="text-slate-400 text-sm mt-1">{t("config.subtitulo")}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Abas */}
        <nav data-tour="config-abas" className="lg:w-48 flex lg:flex-col gap-1 flex-wrap" aria-label="Seções de configurações">
          {([
            { id: "perfil", label: t("config.abaPerfil"), icon: User },
            { id: "academico", label: t("config.abaAcademico"), icon: GraduationCap },
            { id: "tema", label: t("config.abaTema"), icon: Palette },
            { id: "notificacoes", label: t("config.abaNotificacoes"), icon: Bell },
            { id: "responsavel", label: t("config.abaResponsavel"), icon: MailCheck },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setAbaAtiva(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                abaAtiva === id
                  ? "bg-amber-500/15 text-amber-400 font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
              aria-current={abaAtiva === id ? "page" : undefined}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </button>
          ))}

          <div className="lg:mt-auto mt-2 space-y-1">
            <button
              data-tour="config-tutorial-button"
              onClick={() => iniciarTour()}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <HelpCircle size={15} aria-hidden="true" />
              {t("config.verTutorial")}
            </button>
            <button
              onClick={() => deslogar()}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t("config.sairDaConta")}
            </button>
          </div>
        </nav>

        {/* Conteúdo */}
        <div className="flex-1 max-w-lg">
          {abaAtiva === "perfil" && <AbaPerfil user={user} atualizarSenha={atualizarSenha} />}
          {abaAtiva === "academico" && <AbaAcademico userId={user?.id} />}
          {abaAtiva === "tema" && <AbaTema />}
          {abaAtiva === "notificacoes" && <AbaNotificacoes userId={user?.id} />}
          {abaAtiva === "responsavel" && <ResponsavelPainel userId={user?.id} />}
        </div>
      </div>
    </div>
  );
}

function AbaPerfil({ user, atualizarSenha }: { user: ReturnType<typeof useAuth>["user"]; atualizarSenha: (s: string) => Promise<void> }) {
  const { t } = useIdioma();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [uploadandoAvatar, setUploadandoAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    profileService.get(user.id).then((p) => {
      if (p) {
        setPerfil(p);
        setNome(p.name ?? user.user_metadata?.name ?? "");
        setBio(p.bio ?? "");
        setAvatarUrl(p.avatar_url);
      } else {
        setNome(user.user_metadata?.name ?? "");
      }
    });
  }, [user]);

  const iniciais = nome
    ? nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email?.[0] ?? "?").toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(t("config.erroImagemTamanho")); return; }
    setUploadandoAvatar(true);
    try {
      const base64 = await compressImage(file, 256);
      await profileService.upsert({ id: user.id, avatar_url: base64 });
      setAvatarUrl(base64);
      toast.success(t("config.toastAvatarAtualizado"));
    } catch (err) {
      console.error("Avatar error:", err);
      toast.error(t("config.erroSalvarAvatar"));
    } finally {
      setUploadandoAvatar(false);
      e.target.value = "";
    }
  };

  const salvarPerfil = async () => {
    if (!user) return;
    setSalvando(true);
    try {
      await profileService.upsert({ id: user.id, name: nome, bio });
      toast.success(t("config.toastPerfilAtualizado"));
    } catch {
      toast.error(t("config.erroAtualizarPerfil"));
    } finally {
      setSalvando(false);
    }
  };

  const salvarSenha = async () => {
    if (!novaSenha) return;
    if (novaSenha !== confirmarSenha) { toast.error(t("config.erroSenhasNaoConferem")); return; }
    if (novaSenha.length < 6) { toast.error(t("config.erroSenhaCurta")); return; }
    setSalvandoSenha(true);
    try {
      await atualizarSenha(novaSenha);
      setNovaSenha("");
      setConfirmarSenha("");
      toast.success(t("config.toastSenhaAtualizada"));
    } catch {
      toast.error(t("config.erroAtualizarSenha"));
    } finally {
      setSalvandoSenha(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">{t("config.infoPerfil")}</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-amber-400 font-['Space_Grotesk']">{iniciais}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadandoAvatar}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Alterar foto de perfil"
            >
              {uploadandoAvatar ? <Loader2 size={11} className="animate-spin text-black" /> : <Camera size={11} className="text-black" />}
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">{nome || t("config.semNome")}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-amber-400 hover:text-amber-300 mt-1 transition-colors"
            >
              {t("config.alterarFoto")}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nome-perfil" className="text-slate-300 text-sm">{t("config.nome")}</Label>
          <Input
            id="nome-perfil"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-amber-500"
            placeholder={t("config.nomePlaceholder")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio-perfil" className="text-slate-300 text-sm">{t("config.bio")}</Label>
          <Textarea
            id="bio-perfil"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500 resize-none"
            placeholder={t("config.bioPlaceholder")}
            rows={2}
            maxLength={200}
          />
          <p className="text-xs text-slate-600 text-right">{bio.length}/200</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">{t("config.email")}</Label>
          <Input value={user?.email ?? ""} disabled className="bg-white/5 border-white/10 text-slate-500" />
          <p className="text-xs text-slate-600">{t("config.emailNaoAlteravel")}</p>
        </div>

        <Button onClick={salvarPerfil} disabled={salvando} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
          {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {t("config.salvarPerfil")}
        </Button>
      </div>

      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">{t("config.alterarSenha")}</h2>
        <div className="space-y-1.5">
          <Label htmlFor="nova-senha" className="text-slate-300 text-sm">{t("config.novaSenha")}</Label>
          <Input
            id="nova-senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-amber-500"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmar-nova-senha" className="text-slate-300 text-sm">{t("config.confirmarNovaSenha")}</Label>
          <Input
            id="confirmar-nova-senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-amber-500"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        <Button onClick={salvarSenha} disabled={salvandoSenha || !novaSenha} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
          {salvandoSenha ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {t("config.atualizarSenha")}
        </Button>
      </div>
    </div>
  );
}

function AbaTema() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useIdioma();
  const [salvando, setSalvando] = useState(false);

  const aplicarTema = async (novoTema: "dark" | "light") => {
    setTheme?.(novoTema);
    setSalvando(true);
    try {
      if (user) await profileService.upsert({ id: user.id, theme: novoTema });
      const palavra = novoTema === "dark" ? t("config.temaEscuroPalavra") : t("config.temaClaroPalavra");
      toast.success(`${palavra.charAt(0).toUpperCase() + palavra.slice(1)} ${t("config.toastTemaAplicadoSufixo")}`);
    } catch {
      toast.error(t("config.erroSalvarTema"));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">{t("config.aparencia")}</h2>
      <p className="text-xs text-slate-500">{t("config.escolherTema")}</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => aplicarTema("dark")}
          disabled={salvando}
          className={`p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            theme === "dark" ? "border-amber-500 bg-amber-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
          aria-pressed={theme === "dark"}
        >
          <div className="w-full h-12 rounded-lg mb-2 border border-white/10" style={{ background: "#0f1117" }} />
          <p className="text-xs font-medium text-slate-300 text-center">{t("config.escuro")}</p>
          {theme === "dark" && <p className="text-xs text-amber-400 text-center">✓ {t("config.ativo")}</p>}
        </button>
        <button
          onClick={() => aplicarTema("light")}
          disabled={salvando}
          className={`p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            theme === "light" ? "border-amber-500 bg-amber-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
          aria-pressed={theme === "light"}
        >
          <div className="w-full h-12 rounded-lg mb-2 border border-slate-200" style={{ background: "#f0f3f8" }} />
          <p className="text-xs font-medium text-slate-300 text-center">{t("config.claro")}</p>
          {theme === "light" && <p className="text-xs text-amber-400 text-center">✓ {t("config.ativo")}</p>}
        </button>
      </div>
      {salvando && <p className="text-xs text-slate-500 text-center">{t("config.salvandoPreferencia")}</p>}
    </div>
  );
}

function AbaNotificacoes({ userId }: { userId?: string }) {
  const { t } = useIdioma();
  const [settings, setSettings] = useState({
    notify_3_days: true,
    notify_2_days: true,
    notify_1_day: true,
    notify_on_create: false,
    sound_enabled: false,
  });
  const [salvando, setSalvando] = useState(false);
  const [permissao, setPermissao] = useState<NotificationPermission>("default");
  const [ativandoPush, setAtivandoPush] = useState(false);

  useEffect(() => {
    if (notificationService.isSupported()) setPermissao(notificationService.getPermission());
    if (!userId) return;
    settingsService.getNotifications(userId).then((data) => {
      if (data) {
        setSettings({
          notify_3_days: data.notify_3_days,
          notify_2_days: data.notify_2_days,
          notify_1_day: data.notify_1_day,
          notify_on_create: data.notify_on_create ?? false,
          sound_enabled: data.sound_enabled,
        });
        soundService.setEnabled(data.sound_enabled);
      }
    });
  }, [userId]);

  const ativarPush = async () => {
    if (!userId) return;
    setAtivandoPush(true);
    try {
      const granted = await notificationService.requestPermission();
      setPermissao(notificationService.getPermission());
      if (!granted) { toast.error(t("config.erroPermissaoNegada")); return; }
      await notificationService.subscribe(userId);
      toast.success(t("config.toastPushAtivado"));
    } catch {
      toast.error(t("config.erroAtivarNotificacoes"));
    } finally {
      setAtivandoPush(false);
    }
  };

  const desativarPush = async () => {
    if (!userId) return;
    await notificationService.unsubscribe(userId);
    setPermissao("default");
    toast.success(t("config.toastPushDesativado"));
  };

  const salvar = async () => {
    if (!userId) return;
    setSalvando(true);
    try {
      await settingsService.upsertNotifications(userId, settings);
      soundService.setEnabled(settings.sound_enabled);
      if (settings.sound_enabled) soundService.playConcluida();
      toast.success(t("config.toastConfigSalvas"));
    } catch {
      toast.error(t("config.erroSalvarGenerico"));
    } finally {
      setSalvando(false);
    }
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const pushSuportado = notificationService.isSupported();
  const ativo = permissao === "granted";

  const enviarTeste = async () => {
    const ok = await notificationService.sendTest();
    if (ok) toast.success(t("config.toastTesteEnviado"));
    else toast.error(t("config.erroTesteNaoEnviado"));
  };

  return (
    <div className="space-y-4">
      {/* Status do push */}
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-['Space_Grotesk']">
            {t("config.notificacoesPush")}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {t("config.receberAlertas")}
        </p>

        {pushSuportado ? (
          <>
            <div className={`rounded-xl p-4 border flex items-center justify-between gap-3 transition-all ${
              ativo
                ? "bg-green-500/10 border-green-500/30"
                : "bg-amber-500/10 border-amber-500/30"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  ativo ? "bg-green-500/20" : "bg-amber-500/20"
                }`}>
                  {ativo ? "🔔" : "🔕"}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${ativo ? "text-green-400" : "text-amber-400"}`}>
                    {ativo ? t("config.notificacoesAtivas") : t("config.notificacoesDesativadas")}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {ativo
                      ? t("config.avisosChegamFechado")
                      : t("config.ativeParaAlertas")}
                  </p>
                </div>
              </div>
              {ativo ? (
                <Button size="sm" variant="outline" onClick={desativarPush}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent text-xs">
                  {t("config.desativar")}
                </Button>
              ) : (
                <Button size="sm" onClick={ativarPush} disabled={ativandoPush}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs gap-1">
                  {ativandoPush ? <Loader2 size={12} className="animate-spin" /> : null}
                  {t("config.ativar")}
                </Button>
              )}
            </div>

            {ativo && (
              <Button
                variant="outline"
                size="sm"
                onClick={enviarTeste}
                className="w-full border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/10 bg-transparent text-xs"
              >
                {t("config.enviarTeste")}
              </Button>
            )}
          </>
        ) : (
          <div className="rounded-xl p-3 border border-white/10 bg-white/5">
            <p className="text-xs text-slate-500">
              {t("config.navegadorNaoSuporta")}
            </p>
          </div>
        )}
      </div>

      {/* Quando notificar */}
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-1">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-['Space_Grotesk'] mb-1">
          {t("config.quandoAvisar")}
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          {t("config.escolhaMomentos")}
        </p>

        <div className="space-y-1">
          {([
            {
              key: "notify_3_days" as const,
              label: t("config.notif3dias"),
              desc: t("config.notif3diasDesc"),
            },
            {
              key: "notify_2_days" as const,
              label: t("config.notif2dias"),
              desc: t("config.notif2diasDesc"),
            },
            {
              key: "notify_1_day" as const,
              label: t("config.notif1dia"),
              desc: t("config.notif1diaDesc"),
            },
            {
              key: "notify_on_create" as const,
              label: t("config.notifCriar"),
              desc: t("config.notifCriarDesc"),
            },
          ]).map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={key}
                  className="text-sm font-medium text-slate-900 dark:text-slate-200 cursor-pointer"
                >
                  {label}
                </Label>
                <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
              </div>
              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={() => toggle(key)}
                aria-label={label}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sons */}
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-1">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-['Space_Grotesk'] mb-1">
          {t("config.sonsNoApp")}
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          {t("config.feedbackSonoro")}
        </p>
        <div className="flex items-center justify-between gap-3 py-2.5">
          <div className="flex-1 min-w-0">
            <Label
              htmlFor="sound_enabled"
              className="text-sm font-medium text-slate-900 dark:text-slate-200 cursor-pointer"
            >
              {t("config.ativarSons")}
            </Label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t("config.sonsDescricao")}
            </p>
          </div>
          <Switch
            id="sound_enabled"
            checked={settings.sound_enabled}
            onCheckedChange={() => toggle("sound_enabled")}
            aria-label={t("config.ativarSons")}
          />
        </div>
      </div>

      <Button onClick={salvar} disabled={salvando} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
        {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {t("config.salvarPreferencias")}
      </Button>
    </div>
  );
}

// ============================================================
// Aba Acadêmico — ano escolar + idioma + atalho disciplinas
// ============================================================

function AbaAcademico({ userId }: { userId?: string }) {
  const { setIdioma: setIdiomaGlobal, t } = useIdioma();
  const [anoEscolar, setAnoEscolar] = useState<string>("");
  const [idioma, setIdioma] = useState<string>("pt-BR");
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!userId) return;
    profileService.get(userId).then((p) => {
      if (p) {
        setAnoEscolar(p.school_year ?? "");
        setIdioma(p.language ?? "pt-BR");
      }
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [userId]);

  const escolherIdioma = (code: string) => {
    setIdioma(code);
    if (ehIdiomaValido(code)) setIdiomaGlobal(code); // aplica na hora, sem esperar salvar
  };

  const salvar = async () => {
    if (!userId) return;
    setSalvando(true);
    try {
      await profileService.upsert({
        id: userId,
        school_year: anoEscolar || null,
        language: idioma,
      });
      toast.success(t("config.toastAcademicoAtualizado"));
    } catch {
      toast.error(t("config.erroSalvarGenerico"));
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={20} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ano escolar */}
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap size={14} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-['Space_Grotesk']">
            {t("config.anoEscolar")}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {t("config.emQualEtapa")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ANOS_ESCOLARES.map((ano) => {
            const ativo = anoEscolar === ano;
            return (
              <button
                key={ano}
                onClick={() => setAnoEscolar(ativo ? "" : ano)}
                className={`relative p-2.5 rounded-lg border-2 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  ativo
                    ? "border-amber-500 bg-amber-500/10 text-amber-500"
                    : "border-white/10 bg-white/5 text-slate-500 hover:border-white/20 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
                aria-pressed={ativo}
              >
                {ativo && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Check size={9} className="text-black" strokeWidth={3} />
                  </span>
                )}
                {ano}
              </button>
            );
          })}
        </div>
      </div>

      {/* Idioma */}
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Languages size={14} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-['Space_Grotesk']">
            {t("config.idiomaTitulo")}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {t("config.idiomaDescricao")}
        </p>
        <div className="space-y-2">
          {IDIOMAS.map((i) => {
            const ativo = idioma === i.code;
            return (
              <button
                key={i.code}
                onClick={() => escolherIdioma(i.code)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  ativo
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
                aria-pressed={ativo}
              >
                <span className="text-2xl">{i.flag}</span>
                <span className={`flex-1 text-sm font-medium ${ativo ? "text-amber-500" : "text-slate-700 dark:text-slate-300"}`}>
                  {i.label}
                </span>
                {ativo && (
                  <Check size={16} className="text-amber-500" strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Atalho para Disciplinas */}
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5">
        <p className="text-xs text-slate-500">
          {t("config.disciplinasDedicadas")} <strong className="text-slate-700 dark:text-slate-300">{t("nav.disciplinas")}</strong>.
        </p>
      </div>

      <Button
        onClick={salvar}
        disabled={salvando}
        className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
      >
        {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {t("config.salvarPreferencias")}
      </Button>
    </div>
  );
}

