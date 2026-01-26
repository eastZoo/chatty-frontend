/**
 * 브라우저에서 "띠링" 알림음 재생 (Web Audio API, 별도 파일 불필요)
 * 브라우저 정책상 첫 사용자 클릭 후에만 소리가 나올 수 있음.
 */
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioContext) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioContext = new Ctx();
    }
    return audioContext;
  } catch {
    return null;
  }
}

/** 사용자 제스처 이후 한 번 호출해서 오디오 잠금 해제 (앱 초기 클릭 시 호출 권장) */
export function warmupNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
  } catch {
    // ignore
  }
}

export function playNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().then(() => playBeep(ctx)).catch(() => {});
      return;
    }
    playBeep(ctx);
  } catch {
    // 오디오 미지원 시 무시
  }
}

// "딩동" 느낌의 2음 짧은 알림음 (Web Audio API)
function playBeep(ctx: AudioContext): void {
  const t = ctx.currentTime;

  // 첫 번째 '딩' (높은음)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.value = 1046; // C6 ('딩') 약간 밝은 톤
  gain1.gain.setValueAtTime(0, t);
  gain1.gain.linearRampToValueAtTime(0.2, t + 0.01);
  gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.13);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + 0.14);

  // 두 번째 '동' (낮은음)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.value = 698; // F5 ('동')
  const delay = 0.11; // 두음 사이의 잠깐의 간격
  gain2.gain.setValueAtTime(0, t + delay);
  gain2.gain.linearRampToValueAtTime(0.17, t + delay + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.16);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(t + delay);
  osc2.stop(t + delay + 0.18);
}
