import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  estaAutenticado: boolean;
  carregando: boolean;
  cadastrar: (email: string, nome: string, senha: string) => Promise<void>;
  logar: (email: string, senha: string) => Promise<void>;
  deslogar: () => Promise<void>;
  resetarSenha: (email: string) => Promise<void>;
  atualizarSenha: (novaSenha: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    authService.getSession().then((s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setCarregando(false);
    });

    const { data: { subscription } } = authService.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setCarregando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cadastrar = async (email: string, nome: string, senha: string) => {
    await authService.signUp(email, senha, nome);
  };

  const logar = async (email: string, senha: string) => {
    await authService.signIn(email, senha);
  };

  const deslogar = async () => {
    await authService.signOut();
  };

  const resetarSenha = async (email: string) => {
    await authService.resetPassword(email);
  };

  const atualizarSenha = async (novaSenha: string) => {
    await authService.updatePassword(novaSenha);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        estaAutenticado: !!user,
        carregando,
        cadastrar,
        logar,
        deslogar,
        resetarSenha,
        atualizarSenha,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
