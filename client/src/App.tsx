import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { TarefasProvider } from "./contexts/TarefasContext";
import { DisciplinasProvider } from "./contexts/DisciplinasContext";
import { ArquivosProvider } from "./contexts/ArquivosContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { profileService } from "@/services/profileService";
import { notificationService } from "@/services/notificationService";
import { settingsService } from "@/services/settingsService";

function Router() {
  const { estaAutenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="text-amber-400 animate-spin" />
          <p className="text-slate-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (estaAutenticado) {
    return (
      <ArquivosProvider>
        <DisciplinasProvider>
        <TarefasProvider>
          <Switch>
            {/* Rota de reset acessível mesmo quando já autenticado */}
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="" component={Home} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </TarefasProvider>
        </DisciplinasProvider>
      </ArquivosProvider>
    );
  }

  return (
    <Switch>
      {/* Rota pública — não exige autenticação */}
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="" component={Login} />
      <Route component={Login} />
    </Switch>
  );
}

function ThemeLoader() {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  useEffect(() => {
    if (!user || !setTheme) return;
    profileService.get(user.id).then((p) => {
      if (p?.theme === "light" || p?.theme === "dark") setTheme(p.theme);
    });
  }, [user?.id]);
  return null;
}

function NotificationChecker() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user || !notificationService.isSupported()) return;
    if (notificationService.getPermission() !== "granted") return;
    // Verifica tarefas próximas ao abrir o app (uma vez por dia)
    Promise.all([
      import("@/services/taskService").then(m => m.taskService.list(user.id)),
      settingsService.getNotifications(user.id),
    ]).then(([tasks, settings]) => {
      if (settings) notificationService.checkAndNotify(tasks, settings);
    }).catch(() => {});
  }, [user?.id]);
  return null;
}

function ThemedApp() {
  const { theme } = useTheme();
  return (
    <AuthProvider>
      <TooltipProvider>
        <ThemeLoader />
        <NotificationChecker />
        <Toaster
          theme={theme}
          toastOptions={{
            style:
              theme === "dark"
                ? { background: "#1a1d27", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }
                : { background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", color: "#0f172a" },
          }}
        />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <ThemedApp />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
