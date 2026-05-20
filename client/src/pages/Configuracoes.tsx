import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { subjectService } from "@/services/subjectService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import React from "react";
import { Camera, Loader2, Plus, Save, Trash2, User, Bell, Palette, BookOpen } from "lucide-react";
import type { Materia, Perfil } from "@/types";
import { MATERIAS_PADRAO, MATERIAS_CORES } from "@/lib/tarefasData";
import { settingsService } from "@/services/settingsService";
import { soundService } from "@/services/soundService";
import { useTheme } from "@/contexts/ThemeContext";

type Aba = "perfil" | "tema" | "notificacoes" | "materias";

export default function Configuracoes() {
  const { user, deslogar, atualizarSenha } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState<Aba>("perfil");

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">Configurações</h1>
        <p className="text-slate-400 text-sm mt-1">Personalize sua experiência</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Abas */}
        <nav className="lg:w-48 flex lg:flex-col gap-1 flex-wrap" aria-label="Seções de configurações">
          {([
            { id: "perfil", label: "Perfil", icon: User },
            { id: "tema", label: "Aparência", icon: Palette },
            { id: "notificacoes", label: "Notificações", icon: Bell },
            { id: "materias", label: "Matérias", icon: BookOpen },
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

          <div className="lg:mt-auto mt-2">
            <button
              onClick={() => deslogar()}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Sair da conta
            </button>
          </div>
        </nav>

        {/* Conteúdo */}
        <div className="flex-1 max-w-lg">
          {abaAtiva === "perfil" && <AbaPerfil user={user} atualizarSenha={atualizarSenha} />}
          {abaAtiva === "tema" && <AbaTema />}
          {abaAtiva === "notificacoes" && <AbaNotificacoes userId={user?.id} />}
          {abaAtiva === "materias" && <AbaMaterias />}
        </div>
      </div>
    </div>
  );
}

function AbaPerfil({ user, atualizarSenha }: { user: ReturnType<typeof useAuth>["user"]; atualizarSenha: (s: string) => Promise<void> }) {
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
    if (file.size > 2 * 1024 * 1024) { toast.error("Avatar deve ter no máximo 2 MB"); return; }
    setUploadandoAvatar(true);
    try {
      const url = await profileService.uploadAvatar(user.id, file);
      await profileService.update(user.id, { avatar_url: url });
      setAvatarUrl(url);
      toast.success("Avatar atualizado!");
    } catch {
      toast.error("Erro ao enviar avatar — verifique se o bucket 'avatars' existe no Supabase Storage");
    } finally {
      setUploadandoAvatar(false);
      e.target.value = "";
    }
  };

  const salvarPerfil = async () => {
    if (!user) return;
    setSalvando(true);
    try {
      await profileService.update(user.id, { name: nome, bio });
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSalvando(false);
    }
  };

  const salvarSenha = async () => {
    if (!novaSenha) return;
    if (novaSenha !== confirmarSenha) { toast.error("Senhas não conferem"); return; }
    if (novaSenha.length < 6) { toast.error("Senha deve ter ao menos 6 caracteres"); return; }
    setSalvandoSenha(true);
    try {
      await atualizarSenha(novaSenha);
      setNovaSenha("");
      setConfirmarSenha("");
      toast.success("Senha atualizada!");
    } catch {
      toast.error("Erro ao atualizar senha");
    } finally {
      setSalvandoSenha(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Informações do Perfil</h2>

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
            <p className="text-sm font-medium text-slate-200">{nome || "Sem nome"}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-amber-400 hover:text-amber-300 mt-1 transition-colors"
            >
              Alterar foto
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
          <Label htmlFor="nome-perfil" className="text-slate-300 text-sm">Nome</Label>
          <Input
            id="nome-perfil"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-amber-500"
            placeholder="Seu nome"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio-perfil" className="text-slate-300 text-sm">Bio</Label>
          <Textarea
            id="bio-perfil"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500 resize-none"
            placeholder="Conte um pouco sobre você..."
            rows={2}
            maxLength={200}
          />
          <p className="text-xs text-slate-600 text-right">{bio.length}/200</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Email</Label>
          <Input value={user?.email ?? ""} disabled className="bg-white/5 border-white/10 text-slate-500" />
          <p className="text-xs text-slate-600">O email não pode ser alterado aqui</p>
        </div>

        <Button onClick={salvarPerfil} disabled={salvando} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
          {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Salvar Perfil
        </Button>
      </div>

      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Alterar Senha</h2>
        <div className="space-y-1.5">
          <Label htmlFor="nova-senha" className="text-slate-300 text-sm">Nova Senha</Label>
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
          <Label htmlFor="confirmar-nova-senha" className="text-slate-300 text-sm">Confirmar Nova Senha</Label>
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
          Atualizar Senha
        </Button>
      </div>
    </div>
  );
}

function AbaTema() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [salvando, setSalvando] = useState(false);

  const aplicarTema = async (novoTema: "dark" | "light") => {
    setTheme?.(novoTema);
    setSalvando(true);
    try {
      if (user) await profileService.update(user.id, { theme: novoTema });
      toast.success(`Tema ${novoTema === "dark" ? "escuro" : "claro"} aplicado!`);
    } catch {
      toast.error("Erro ao salvar preferência de tema");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Aparência</h2>
      <p className="text-xs text-slate-500">Escolha o tema da interface</p>
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
          <p className="text-xs font-medium text-slate-300 text-center">Escuro</p>
          {theme === "dark" && <p className="text-xs text-amber-400 text-center">✓ Ativo</p>}
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
          <p className="text-xs font-medium text-slate-300 text-center">Claro</p>
          {theme === "light" && <p className="text-xs text-amber-400 text-center">✓ Ativo</p>}
        </button>
      </div>
      {salvando && <p className="text-xs text-slate-500 text-center">Salvando preferência...</p>}
    </div>
  );
}

function AbaNotificacoes({ userId }: { userId?: string }) {
  const [settings, setSettings] = useState({
    notify_3_days: true,
    notify_2_days: true,
    notify_1_day: true,
    sound_enabled: false,
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!userId) return;
    settingsService.getNotifications(userId).then((data) => {
      if (data) {
        setSettings({
          notify_3_days: data.notify_3_days,
          notify_2_days: data.notify_2_days,
          notify_1_day: data.notify_1_day,
          sound_enabled: data.sound_enabled,
        });
        soundService.setEnabled(data.sound_enabled);
      }
    });
  }, [userId]);

  const salvar = async () => {
    if (!userId) return;
    setSalvando(true);
    try {
      await settingsService.upsertNotifications(userId, settings);
      soundService.setEnabled(settings.sound_enabled);
      if (settings.sound_enabled) soundService.playConcluida();
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Notificações</h2>
      <p className="text-xs text-slate-500">Configure alertas de prazo</p>
      <div className="space-y-3">
        {([
          { key: "notify_3_days" as const, label: "Alertar 3 dias antes" },
          { key: "notify_2_days" as const, label: "Alertar 2 dias antes" },
          { key: "notify_1_day" as const, label: "Alertar 1 dia antes" },
          { key: "sound_enabled" as const, label: "Habilitar sons de transição" },
        ]).map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <Label htmlFor={key} className="text-slate-300 text-sm cursor-pointer">{label}</Label>
            <Switch
              id={key}
              checked={settings[key]}
              onCheckedChange={() => toggle(key)}
              aria-label={label}
            />
          </div>
        ))}
      </div>
      <Button onClick={salvar} disabled={salvando} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
        {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Salvar
      </Button>
    </div>
  );
}

function AbaMaterias() {
  const { user } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novaMateria, setNovaMateria] = useState("");
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    if (!user) return;
    subjectService.list(user.id).then((data) => {
      setMaterias(data);
      setCarregando(false);
    }).catch(() => setCarregando(false));
  }, [user]);

  const adicionarPadrao = async (nome: string) => {
    if (!user || materias.some((m) => m.name === nome)) return;
    const cor = MATERIAS_CORES[nome] ?? "#94a3b8";
    try {
      const nova = await subjectService.create(user.id, nome, cor);
      setMaterias((prev) => [...prev, nova].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`${nome} adicionada!`);
    } catch {
      toast.error("Erro ao adicionar matéria");
    }
  };

  const adicionarPersonalizada = async () => {
    const nome = novaMateria.trim();
    if (!nome || !user) return;
    if (materias.some((m) => m.name.toLowerCase() === nome.toLowerCase())) {
      toast.error("Matéria já existe"); return;
    }
    setAdicionando(true);
    try {
      const nova = await subjectService.create(user.id, nome, "#94a3b8");
      setMaterias((prev) => [...prev, nova].sort((a, b) => a.name.localeCompare(b.name)));
      setNovaMateria("");
      toast.success(`${nome} adicionada!`);
    } catch {
      toast.error("Erro ao adicionar matéria");
    } finally {
      setAdicionando(false);
    }
  };

  const remover = async (id: string, nome: string) => {
    try {
      await subjectService.delete(id);
      setMaterias((prev) => prev.filter((m) => m.id !== id));
      toast.success(`${nome} removida`);
    } catch {
      toast.error("Erro ao remover matéria");
    }
  };

  const materiasPadraoNaoAdicionadas = MATERIAS_PADRAO
    .filter((m) => m !== "Outra" && !materias.some((x) => x.name === m));

  return (
    <div className="space-y-4">
      {/* Matérias ativas */}
      <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Suas Matérias</h2>
          {!carregando && <span className="text-xs text-slate-500">{materias.length} matéria{materias.length !== 1 ? "s" : ""}</span>}
        </div>

        {carregando ? (
          <div className="flex justify-center py-4">
            <Loader2 size={18} className="animate-spin text-amber-400" />
          </div>
        ) : materias.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">Nenhuma matéria adicionada ainda. Adicione abaixo.</p>
        ) : (
          <div className="space-y-1.5">
            {materias.map((m) => (
              <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 group">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                <span className="text-sm text-slate-200 flex-1">{m.name}</span>
                <button
                  onClick={() => remover(m.id, m.name)}
                  className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:outline-none focus:ring-1 focus:ring-red-500 rounded"
                  aria-label={`Remover ${m.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar personalizada */}
        <div className="flex gap-2 pt-1">
          <Input
            value={novaMateria}
            onChange={(e) => setNovaMateria(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionarPersonalizada()}
            placeholder="Nova matéria personalizada..."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500 h-9 text-sm"
          />
          <Button
            onClick={adicionarPersonalizada}
            disabled={adicionando || !novaMateria.trim()}
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold h-9 gap-1.5 flex-shrink-0"
          >
            {adicionando ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Adicionar
          </Button>
        </div>
      </div>

      {/* Matérias padrão para adicionar rapidamente */}
      {materiasPadraoNaoAdicionadas.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-white/8 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Adicionar Matéria Padrão</h2>
          <div className="grid grid-cols-2 gap-2">
            {materiasPadraoNaoAdicionadas.map((nome) => {
              const cor = MATERIAS_CORES[nome] ?? "#94a3b8";
              return (
                <button
                  key={nome}
                  onClick={() => adicionarPadrao(nome)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-white/8 text-slate-400 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
                  <span className="truncate">{nome}</span>
                  <Plus size={11} className="ml-auto flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
