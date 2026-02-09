/**
 * Configuration options for encoding
 */
export interface EncodingConfig {
  /**
   * Sample rate for encoding
   */
  sampleRate?: number;

  /**
   * Audio bitrate in bits per second
   */
  audioBitsPerSecond?: number;

  /**
   * Number of audio channels
   */
  channelCount?: number;
}

/**
 * Supported audio formats
 */
export type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'webm';
