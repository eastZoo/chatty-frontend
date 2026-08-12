/**
 * 알림음 재생 (Web Audio API + HTML Audio 폴백)
 * - 포그라운드: Web Audio API (딩동)
 * - 백그라운드 탭/다른 창/최소화: HTML5 Audio (사전 로딩·잠금해제 후 재생)
 * 브라우저 정책상 첫 사용자 클릭 후 warmup 호출 필요.
 */

let audioContext: AudioContext | null = null;
let fallbackAudio: HTMLAudioElement | null = null;
let fallbackDataUrl: string | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioContext) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;
      audioContext = new Ctx();
    }
    return audioContext;
  } catch {
    return null;
  }
}

/** 짧은 비프 WAV 데이터 URL 생성 (백그라운드용 HTML Audio) */
function getBeepDataUrl(): string {
  if (fallbackDataUrl) return fallbackDataUrl;
  const sampleRate = 44100;
  const duration = 0.18;
  const numSamples = Math.round(sampleRate * duration);
  const buf = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buf);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);
  const frequency = 880;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = i < 20 ? i / 20 : i > numSamples - 200 ? (numSamples - i) / 200 : 1;
    const s = Math.sin(2 * Math.PI * frequency * t) * 0.28 * env;
    const v = Math.max(-32768, Math.min(32767, Math.floor(s * 32767)));
    view.setInt16(44 + i * 2, v, true);
  }
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  fallbackDataUrl = "data:audio/wav;base64," + btoa(binary);
  return fallbackDataUrl;
}

/** HTML5 Audio로 재생 (백그라운드 탭에서도 동작하도록 사전 로드·잠금해제 필요) */
function playWithFallbackAudio(): void {
  try {
    if (typeof window === "undefined") return;
    const url = getBeepDataUrl();
    const audio = fallbackAudio || new Audio(url);
    if (!fallbackAudio) fallbackAudio = audio;
    audio.volume = 1;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

/** 사용자 제스처 이후 호출: Web Audio 잠금 해제 + HTML Audio 사전 로드·재생 권한 획득 */
export function warmupNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const url = getBeepDataUrl();
    const audio = new Audio(url);
    fallbackAudio = audio;
    audio.volume = 0;
    audio.play().then(() => audio.pause()).catch(() => {});
  } catch {
    // ignore
  }
}

export function playNotificationSound(): void {
  const isBackground =
    typeof document !== "undefined" && document.visibilityState === "hidden";

  if (isBackground) {
    playWithFallbackAudio();
    return;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) {
      playWithFallbackAudio();
      return;
    }
    if (ctx.state === "suspended") {
      ctx.resume().then(() => playBeep(ctx)).catch(() => playWithFallbackAudio());
      return;
    }
    playBeep(ctx);
  } catch {
    playWithFallbackAudio();
  }
}

function playBeep(ctx: AudioContext): void {
  try {
    const t = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.17);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(t);
    oscillator.stop(t + 0.18);
  } catch {
    playWithFallbackAudio();
  }
}
