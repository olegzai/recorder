/**
 * Configuration options for file export
 */
export interface FileExportConfig {
  /**
   * Sample rate for encoding
   */
  sampleRate?: number;

  /**
   * Audio bitrate in bits per second
   */
  audioBitsPerSecond?: number;

  /**
   * Custom filename for export
   */
  filename?: string;
}

/**
 * Metadata associated with a recording
 */
export interface RecordingMetadata {
  /**
   * ID of the recording
   */
  id?: string;

  /**
   * Title of the recording
   */
  title?: string;

  /**
   * Timestamp of when the recording was made
   */
  timestamp?: number;

  /**
   * Duration of the recording in seconds
   */
  duration?: number;

  /**
   * Format of the recording
   */
  format?: string;

  /**
   * Size of the recording in bytes
   */
  size?: number;

  /**
   * Language of the recording (for transcription/translation)
   */
  language?: string;

  /**
   * Transcription of the recording
   */
  transcription?: string;

  /**
   * Translation of the recording
   */
  translation?: string;
}
