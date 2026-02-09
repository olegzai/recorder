/**
 * Configuration options for audio input
 */
export interface AudioInputConfig {
  /**
   * Constraints for the audio input
   */
  constraints?: MediaTrackConstraints;

  /**
   * Sample rate for audio processing
   */
  sampleRate?: number;

  /**
   * Number of audio channels (1 for mono, 2 for stereo)
   */
  channelCount?: number;
}

/**
 * Represents an active audio stream with associated processing nodes
 */
export interface AudioStream {
  /**
   * The media stream from the microphone
   */
  stream: MediaStream;

  /**
   * The audio context used for processing
   */
  audioContext: AudioContext;

  /**
   * Analyser node for audio visualization
   */
  analyser: AnalyserNode;
}
