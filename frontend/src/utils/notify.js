// Small helper utilities for sound + desktop notifications.

let audioCtx = null;

export function playNotificationSound() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.35);
  } catch (err) {
    console.error('Notification sound failed:', err);
  }
}

export async function requestDesktopPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

export function showDesktopNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

let originalTitle = document.title;
let flashInterval = null;

export function flashTabTitle(message) {
  if (!document.hidden) return; // only flash if tab isn't focused
  originalTitle = originalTitle || document.title;
  let showAlt = true;
  clearInterval(flashInterval);
  flashInterval = setInterval(() => {
    document.title = showAlt ? message : originalTitle;
    showAlt = !showAlt;
  }, 1200);

  const stop = () => {
    clearInterval(flashInterval);
    document.title = originalTitle;
    document.removeEventListener('visibilitychange', stop);
  };
  document.addEventListener('visibilitychange', stop, { once: true });
}
