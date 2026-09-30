// ─── Audio & Browser Notification API Helpers ────────────────────────────────
// Plays alert chime until pending orders are set to 'preparing' by the owner.

let permissionGranted = false;
let audioContext: AudioContext | null = null;
let alertIntervalId: NodeJS.Timeout | null = null;
let isAudioLoopRunning = false;
let soundMuted = false;

export function isSoundMuted(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sudama_admin_sound_muted') === 'true';
  }
  return soundMuted;
}

export function setSoundMuted(muted: boolean): void {
  soundMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('sudama_admin_sound_muted', muted ? 'true' : 'false');
  }
  if (muted) {
    stopPendingAlertLoop();
  }
}

/**
 * Initializes or unlocks the shared AudioContext on first user interaction.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  } catch {
    return null;
  }
}

/**
 * Synthesizes a loud, distinct, pleasant dual-tone restaurant service chime.
 */
export function playOrderAlertChime(): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const playNote = (freq: number, startOffset: number, duration: number, volume = 0.5) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Smooth, bell-like tone
      osc.frequency.setValueAtTime(freq, now + startOffset);

      gain.gain.setValueAtTime(volume, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration);
    };

    // Ding-Dong-Ding restaurant chime: E5 (659Hz) -> A5 (880Hz) -> E6 (1318Hz)
    playNote(659.25, 0.0, 0.45, 0.45);
    playNote(880.00, 0.18, 0.55, 0.5);
    playNote(1318.51, 0.38, 0.85, 0.6);
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

/**
 * Sound for customer calling waiter or asking for water.
 */
export function playStaffAlertSound(): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.3); // G5

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (err) {
    console.warn('Staff alert sound error:', err);
  }
}

/**
 * Starts continuous repeating audio alert until owner marks order as 'preparing'.
 * Rings every 3.5 seconds.
 */
export function startPendingAlertLoop(): void {
  if (isAudioLoopRunning || isSoundMuted()) return;
  isAudioLoopRunning = true;

  // Play immediately
  playOrderAlertChime();

  // Repeat every 3.5 seconds
  alertIntervalId = setInterval(() => {
    if (!isAudioLoopRunning) {
      if (alertIntervalId) clearInterval(alertIntervalId);
      return;
    }
    playOrderAlertChime();
  }, 3500);
}

/**
 * Stops the continuous repeating audio alert.
 */
export function stopPendingAlertLoop(): void {
  isAudioLoopRunning = false;
  if (alertIntervalId) {
    clearInterval(alertIntervalId);
    alertIntervalId = null;
  }
}

export function isAlertLoopActive(): boolean {
  return isAudioLoopRunning;
}

/**
 * Request browser notification permission (call once on admin page mount).
 */
export async function requestNotificationPermission(): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    permissionGranted = true;
    return;
  }

  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    permissionGranted = result === 'granted';
  }
}

/**
 * Fire a browser notification for a new order.
 */
export function notifyNewOrder(tableNumber: number, itemCount: number): void {
  if (typeof window === 'undefined' || !permissionGranted) return;

  try {
    const n = new Notification('🛎️ New Order Received!', {
      body: `Table ${tableNumber} placed an order with ${itemCount} item${itemCount === 1 ? '' : 's'}.`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `order-table-${tableNumber}`,
    });

    setTimeout(() => n.close(), 5000);
  } catch {
    // Fail silently
  }
}
