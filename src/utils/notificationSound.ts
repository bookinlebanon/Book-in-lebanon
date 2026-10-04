// Plays a short chime (and a vibration where supported) for incoming notifications and messages.

const SOUND_KEY = 'book_in_lebanon_sound_enabled';

let audio: HTMLAudioElement | null = null;
let unlocked = false;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio('./notification.wav');
    audio.preload = 'auto';
  }
  return audio;
}

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== '0';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? '1' : '0');
  } catch {
    // Storage blocked: the choice lasts for this visit only.
  }
}

/**
 * Browsers only allow sound after the user has touched the page, so prime the
 * audio element silently on the first interaction.
 */
export function unlockSoundOnFirstInteraction() {
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    const a = getAudio();
    a.muted = true;
    a.play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
      })
      .catch(() => {})
      .finally(() => {
        a.muted = false;
      });
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

export function playNotificationSound() {
  if (!isSoundEnabled()) return;
  const a = getAudio();
  a.currentTime = 0;
  a.play().catch(() => {});
  try {
    navigator.vibrate?.([120, 60, 120]);
  } catch {
    // Vibration unsupported (e.g. iPhone): sound only.
  }
}
