import type { AudioFormat } from './encoding.types';

/**
 * Check if the browser supports encoding to a specific format
 */
export function isFormatSupported(format: AudioFormat): boolean {
  const mimeTypes: { [key in AudioFormat]: string } = {
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    webm: 'audio/webm',
  };

  if (typeof MediaRecorder !== 'undefined') {
    return MediaRecorder.isTypeSupported(mimeTypes[format]);
  }

  // Fallback check for audio element
  const audio = new Audio();
  return audio.canPlayType(mimeTypes[format]) !== '';
}

/**
 * Get the MIME type for a given audio format
 */
export function getMimeTypeForFormat(format: AudioFormat): string {
  const mimeTypes: { [key in AudioFormat]: string } = {
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    webm: 'audio/webm',
  };

  return mimeTypes[format];
}

/**
 * Get the file extension for a given audio format
 */
export function getFileExtensionForFormat(format: AudioFormat): string {
  return `.${format}`;
}

/**
 * Get the optimal encoding configuration based on format
 */
export function getOptimalEncodingConfig(
  format: AudioFormat,
  customConfig?: {
    sampleRate?: number;
    audioBitsPerSecond?: number;
  },
): { sampleRate?: number; audioBitsPerSecond?: number } {
  const config: { sampleRate?: number; audioBitsPerSecond?: number } = {};

  // Set default values based on format
  switch (format) {
    case 'wav':
      // WAV is uncompressed, so bitrate isn't as relevant
      config.sampleRate = customConfig?.sampleRate || 44100;
      break;
    case 'mp3':
      config.audioBitsPerSecond = customConfig?.audioBitsPerSecond || 128000;
      config.sampleRate = customConfig?.sampleRate || 44100;
      break;
    case 'ogg':
      config.audioBitsPerSecond = customConfig?.audioBitsPerSecond || 128000;
      config.sampleRate = customConfig?.sampleRate || 44100;
      break;
    case 'webm':
      config.audioBitsPerSecond = customConfig?.audioBitsPerSecond || 128000;
      config.sampleRate = customConfig?.sampleRate || 44100;
      break;
  }

  return config;
}
