/**
 * Configuration options for recording
 */
export interface RecordingConfig {
  /**
   * MIME type for the recording
   */
  mimeType?: string;

  /**
   * Audio bitrate in bits per second
   */
  audioBitsPerSecond?: number;

  /**
   * Sample rate for recording
   */
  sampleRate?: number;

  /**
   * Number of audio channels
   */
  channelCount?: number;
}

/**
 * Possible states of the recording engine
 */
export type RecordingState =
  | 'idle' // Ready to start recording
  | 'recording' // Currently recording
  | 'paused' // Recording paused
  | 'stopped' // Recording stopped
  | 'error'; // Error occurred

/**
 * Events that can be emitted by the recording engine
 */
export interface RecordingEvent {
  /**
   * Type of event
   */
  type: string;

  /**
   * Timestamp of the event
   */
  timestamp: number;

  /**
   * State change event data
   */
  state?: RecordingState;

  /**
   * Error event data
   */
  error?: Error;

  /**
   * Recording complete event data
   */
  blob?: Blob;
  duration?: number;
}
