import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, User, Bell, Palette, Globe, BookOpen } from "lucide-react";
import type { Perfil } from "@/types";
import { MATERIAS_PADRAO, MATERIAS_CORES } from "@/lib/tarefasData";
import { settingsService } from "@/services/settingsService";

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
  const [nome, setNome] = useState(user?.user_metadata?.name ?? "");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const salvarPerfil = async () => {
    if (!user) return;
    setSalvando(true);
    try {
      await profileService.update(user.id, { name: nome });
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
      <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Informações do Perfil</h2>
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
          <Label className="text-slate-300 text-sm">Email</Label>
          <Input value={user?.email ?? ""} disabled className="bg-white/5 border-white/10 text-slate-500" />
          <p className="text-xs text-slate-600">O email não pode ser alterado aqui</p>
        </div>
        <Button onClick={salvarPerfil} disabled={salvando} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
          {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Salvar Perfil
        </Button>
      </div>

      <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5 space-y-4">
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
  const [tema, setTema] = useState<"dark" | "light">("dark");

  return (
    <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Aparência</h2>
      <p className="text-xs text-slate-500">Escolha o tema da interface</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setTema("dark")}
          className={`p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            tema === "dark" ? "border-amber-500 bg-amber-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
          aria-pressed={tema === "dark"}
        >
          <div className="w-full h-12 bg-[#0f1117] rounded-lg mb-2 border border-white/10" />
          <p className="text-xs font-medium text-slate-300 text-center">Escuro</p>
          {tema === "dark" && <p className="text-xs text-amber-400 text-center">✓ Ativo</p>}
        </button>
        <button
          onClick={() => { setTema("light"); toast.info("Tema claro em breve!"); }}
          className="p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-white/20 transition-all opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-pressed={tema === "light"}
        >
          <div className="w-full h-12 bg-slate-100 rounded-lg mb-2 border border-slate-200" />
          <p className="text-xs font-medium text-slate-300 text-center">Claro</p>
          <p className="text-xs text-slate-500 text-center">Em breve</p>
        </button>
      </div>
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
      if (data) setSettings({
        notify_3_days: data.notify_3_days,
        notify_2_days: data.notify_2_days,
        notify_1_day: data.notify_1_day,
        sound_enabled: data.sound_enabled,
      });
    });
  }, [userId]);

  const salvar = async () => {
    if (!userId) return;
    setSalvando(true);
    try {
      await settingsService.upsertNotifications(userId, settings);
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
    <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5 space-y-4">
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
  const [materiasSelecionadas, setMateriasSelecionadas] = useState<string[]>([...MATERIAS_PADRAO]);

  const toggleMateria = (m: string) => {
    setMateriasSelecionadas((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  return (
    <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-200 font-['Space_Grotesk']">Matérias</h2>
      <p className="text-xs text-slate-500">Selecione as matérias que você cursa (funcionalidade de sincronização em breve)</p>
      <div className="grid grid-cols-2 gap-2">
        {MATERIAS_PADRAO.filter((m) => m !== "Outra").map((materia) => {
          const cor = MATERIAS_CORES[materia] ?? "#94a3b8";
          const ativo = materiasSelecionadas.includes(materia);
          return (
            <button
              key={materia}
              onClick={() => toggleMateria(materia)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                ativo ? "border-white/20 bg-white/8 text-slate-200" : "border-white/8 text-slate-500 hover:border-white/15"
              }`}
              aria-pressed={ativo}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
              <span className="truncate">{materia}</span>
              {ativo && <span className="ml-auto text-amber-400">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
