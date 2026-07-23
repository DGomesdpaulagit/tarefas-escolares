import { useEffect } from "react";
import { useMesada } from "@/contexts/MesadaContext";
import { notificationService } from "@/services/notificationService";

export default function MesadaNotificationChecker() {
  const { materias, notaDoMes, carregando } = useMesada();

  useEffect(() => {
    if (carregando) return;
    if (!notificationService.isSupported() || notificationService.getPermission() !== "granted") return;

    const mesAtual = new Date().getMonth() + 1;
    const materiasAtivas = materias.filter((m) => m.ativa);
    const faltando = materiasAtivas.filter((m) => !notaDoMes(m.id, mesAtual)).length;

    notificationService.checkMesadaReminder(faltando);
  }, [carregando, materias, notaDoMes]);

  return null;
}
