import type {
  RecordingConfig,
  RecordingEvent,
  RecordingState,
} from './recording-engine.types';

/**
 * RecordingEngineModule manages the recording lifecycle (start/stop/pause)
 */
export class RecordingEngineModule {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number | null = null;
  private recordingState: RecordingState = 'idle';
  private eventListeners: {
    [key: string]: Array<(event: RecordingEvent) => void>;
  } = {};

  /**
   * Initialize the recording engine with audio stream
   */
  initialize(stream: MediaStream, config?: RecordingConfig): void {
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: config?.mimeType || 'audio/webm',
      audioBitsPerSecond: config?.audioBitsPerSecond || 128000,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstart = () => {
      this.startTime = Date.now();
      this.recordingState = 'recording';
      this.emit('stateChange', {
        state: 'recording',
        timestamp: this.startTime,
      });
    };

    this.mediaRecorder.onstop = () => {
      this.recordingState = 'stopped';
      this.emit('stateChange', { state: 'stopped', timestamp: Date.now() });
      this.emit('recordingComplete', {
        blob: this.getRecordingBlob(),
        duration: this.getDuration(),
        timestamp: Date.now(),
      });
    };

    this.mediaRecorder.onerror = (event: Event) => {
      this.recordingState = 'error';
      this.emit('error', {
        error: (event as ErrorEvent).error,
        timestamp: Date.now(),
      });
    };

    this.mediaRecorder.onpause = () => {
      this.recordingState = 'paused';
      this.emit('stateChange', { state: 'paused', timestamp: Date.now() });
    };

    this.mediaRecorder.onresume = () => {
      this.recordingState = 'recording';
      this.emit('stateChange', { state: 'recording', timestamp: Date.now() });
    };
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error(
        'Recording engine not initialized. Call initialize() first.',
      );
    }

    if (this.recordingState !== 'idle' && this.recordingState !== 'stopped') {
      throw new Error(
        `Cannot start recording in state: ${this.recordingState}`,
      );
    }

    this.audioChunks = [];
    this.mediaRecorder.start();
  }

  /**
   * Stop recording audio
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(
          new Error(
            'Recording engine not initialized. Call initialize() first.',
          ),
        );
        return;
      }

      if (
        this.recordingState !== 'recording' &&
        this.recordingState !== 'paused'
      ) {
        reject(
          new Error(`Cannot stop recording in state: ${this.recordingState}`),
        );
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.recordingState = 'stopped';
        this.emit('stateChange', { state: 'stopped', timestamp: Date.now() });

        const recordingBlob = this.getRecordingBlob();
        this.emit('recordingComplete', {
          blob: recordingBlob,
          duration: this.getDuration(),
          timestamp: Date.now(),
        });

        resolve(recordingBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (!this.mediaRecorder) {
      throw new Error(
        'Recording engine not initialized. Call initialize() first.',
      );
    }

    if (this.recordingState !== 'recording') {
      throw new Error(
        `Cannot pause recording in state: ${this.recordingState}`,
      );
    }

    this.mediaRecorder.pause();
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (!this.mediaRecorder) {
      throw new Error(
        'Recording engine not initialized. Call initialize() first.',
      );
    }

    if (this.recordingState !== 'paused') {
      throw new Error(
        `Cannot resume recording in state: ${this.recordingState}`,
      );
    }

    this.mediaRecorder.resume();
  }

  /**
   * Get the current recording state
   */
  getState(): RecordingState {
    return this.recordingState;
  }

  /**
   * Get the duration of the current recording
   */
  getDuration(): number {
    if (this.startTime) {
      return (Date.now() - this.startTime) / 1000; // Return in seconds
    }
    return 0;
  }

  /**
   * Get the recorded audio as a Blob
   */
  getRecordingBlob(): Blob {
    if (this.audioChunks.length === 0) {
      return new Blob([], { type: 'audio/webm' });
    }
    return new Blob(this.audioChunks, {
      type: this.mediaRecorder?.mimeType ?? 'audio/webm',
    });
  }

  /**
   * Add event listener
   */
  on(event: string, callback: (event: RecordingEvent) => void): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: (event: RecordingEvent) => void): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (listener) => listener !== callback,
      );
    }
  }

  /**
   * Emit an event
   */
  private emit(event: string, data: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => callback(data));
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.mediaRecorder && this.recordingState === 'recording') {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = null;
    this.recordingState = 'idle';
    this.eventListeners = {};
  }
}

// Default instance
export const recordingEngineModule = new RecordingEngineModule();
