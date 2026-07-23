import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UserMenuProps {
  onNavegar?: (pagina: string) => void;
}

export default function UserMenu({ onNavegar }: UserMenuProps) {
  const { user, deslogar } = useAuth();
  const [aberto, setAberto] = useState(false);

  if (!user) return null;

  const nome = user.user_metadata?.name ?? user.email ?? "Usuário";
  const primeiraLetra = nome.charAt(0).toUpperCase();

  const handleDeslogar = async () => {
    try {
      await deslogar();
      setAberto(false);
      toast.success("Até logo!");
    } catch {
      toast.error("Erro ao sair");
    }
  };

  return (
    <div className="relative">
      <button
        data-tour="user-menu"
        onClick={() => setAberto(!aberto)}
        className="w-9 h-9 rounded-lg bg-amber-500 text-black font-semibold flex items-center justify-center hover:bg-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        title={nome}
        aria-label={`Menu do usuário: ${nome}`}
        aria-expanded={aberto}
      >
        {primeiraLetra}
      </button>

      {aberto && (
        <>
          <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                <User size={13} className="text-slate-400" aria-hidden="true" />
                <p className="text-sm font-semibold text-white truncate">{nome}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-slate-400" aria-hidden="true" />
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="p-2">
              {onNavegar && (
                <Button
                  onClick={() => { onNavegar("configuracoes"); setAberto(false); }}
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-white/10 hover:text-white text-sm"
                >
                  <Settings size={14} className="mr-2" aria-hidden="true" />
                  Configurações
                </Button>
              )}
              <Button
                onClick={handleDeslogar}
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:bg-red-500/10 hover:text-red-400 text-sm"
              >
                <LogOut size={14} className="mr-2" aria-hidden="true" />
                Sair
              </Button>
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} aria-hidden="true" />
        </>
      )}
    </div>
  );
}
