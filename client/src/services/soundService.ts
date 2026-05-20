const STORAGE_KEY = "sound_enabled";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
  }
  return ctx;
}

function isEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function play(
  frequency: number,
  endFrequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.18
) {
  if (!isEnabled()) return;
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFrequency, ac.currentTime + duration);
    gainNode.gain.setValueAtTime(gain, ac.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch {
    // AudioContext indisponível (SSR, política do navegador, etc.)
  }
}

export const soundService = {
  setEnabled(enabled: boolean) {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  },

  isEnabled,

  /** Tarefa concluída — chime ascendente */
  playConcluida() {
    play(440, 880, 0.35, "sine", 0.18);
  },

  /** Tarefa desmarcada — tom descendente suave */
  playDesmarcada() {
    play(660, 440, 0.25, "sine", 0.12);
  },

  /** Nova tarefa adicionada — pop curto */
  playAdicionada() {
    play(523, 659, 0.15, "sine", 0.14);
  },

  /** Tarefa removida — descida rápida */
  playRemovida() {
    play(440, 220, 0.2, "sine", 0.12);
  },
};
