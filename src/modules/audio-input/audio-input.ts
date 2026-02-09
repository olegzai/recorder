import type { AudioInputConfig, AudioStream } from './audio-input.types';

/**
 * AudioInputModule handles microphone access and audio input processing
 */
export class AudioInputModule {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;

  /**
   * Initialize the audio input module
   */
  async initialize(config?: AudioInputConfig): Promise<AudioStream> {
    try {
      // Create audio context
      this.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...config?.constraints,
        },
      });

      // Create analyser node for visualization
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(
        this.mediaStream,
      );
      this.microphone.connect(this.analyser);

      return {
        stream: this.mediaStream,
        audioContext: this.audioContext,
        analyser: this.analyser,
      };
    } catch (error) {
      throw new Error(
        `Failed to initialize audio input: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get the current audio stream
   */
  getStream(): MediaStream | null {
    return this.mediaStream;
  }

  /**
   * Get the audio context
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Get the analyser node for visualization
   */
  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  /**
   * Get microphone input level for visualization
   */
  getInputLevel(): number {
    if (!this.analyser) {
      return 0;
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount || 1024);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate average amplitude
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }

    return sum / dataArray.length / 255; // Normalize to 0-1 range
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.audioContext) {
      if (this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      this.audioContext = null;
    }
  }
}

// Default instance
export const audioInputModule = new AudioInputModule();
