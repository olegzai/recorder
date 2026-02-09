import type { RecordingState } from './recording-engine.types';

/**
 * Check if the browser supports the MediaRecorder API
 */
export function isMediaRecorderSupported(): boolean {
  return typeof MediaRecorder !== 'undefined';
}

/**
 * Get the optimal MIME type based on browser support
 */
export function getOptimalMimeType(): string {
  if (typeof MediaRecorder !== 'undefined') {
    // Check for WebM support first (better quality/compression)
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      return 'audio/webm';
    }
    // Check for MP3 support
    if (MediaRecorder.isTypeSupported('audio/mp3')) {
      return 'audio/mp3';
    }
    // Check for OGG support
    if (MediaRecorder.isTypeSupported('audio/ogg')) {
      return 'audio/ogg';
    }
    // Fallback to WAV
    if (MediaRecorder.isTypeSupported('audio/wav')) {
      return 'audio/wav';
    }
  }
  // Default fallback
  return 'audio/webm';
}

/**
 * Format recording configuration based on browser capabilities
 */
export function formatRecordingConfig(config?: {
  mimeType?: string;
  audioBitsPerSecond?: number;
  sampleRate?: number;
}): { mimeType?: string; audioBitsPerSecond?: number } {
  const formattedConfig: { mimeType?: string; audioBitsPerSecond?: number } =
    {};

  // Determine optimal MIME type if not specified
  if (config?.mimeType) {
    formattedConfig.mimeType = config.mimeType;
  } else {
    formattedConfig.mimeType = getOptimalMimeType();
  }

  // Set audio bitrate if provided
  if (config?.audioBitsPerSecond) {
    formattedConfig.audioBitsPerSecond = config.audioBitsPerSecond;
  }

  return formattedConfig;
}

/**
 * Validate recording state transitions
 */
export function isValidStateTransition(
  currentState: RecordingState,
  newState: RecordingState,
): boolean {
  const validTransitions: { [key in RecordingState]: RecordingState[] } = {
    idle: ['recording'],
    recording: ['paused', 'stopped'],
    paused: ['recording', 'stopped'],
    stopped: ['recording'],
    error: ['idle'],
  };

  return validTransitions[currentState]?.includes(newState) || false;
}
