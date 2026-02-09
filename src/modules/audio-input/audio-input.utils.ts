/**
 * Check if the browser supports the required audio APIs
 */
export function isAudioApiSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    window.MediaRecorder &&
    window.AudioContext
  );
}

/**
 * Check if microphone access is permitted
 */
export async function isMicrophoneAccessible(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Format audio constraints based on configuration
 */
export function formatAudioConstraints(config?: {
  sampleRate?: number;
  channelCount?: number;
}): MediaTrackConstraints {
  const constraints: MediaTrackConstraints = {};

  if (config?.sampleRate) {
    constraints.sampleRate = config.sampleRate;
  }

  if (config?.channelCount) {
    constraints.channelCount = config.channelCount;
  }

  return constraints;
}
