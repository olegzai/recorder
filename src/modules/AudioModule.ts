// Модуль для работы с аудио
import type { AudioConfig, RecordingConfig } from '../types';
import { loggingModule } from './logging';

class AudioModule {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async initialize(config?: AudioConfig): Promise<MediaStream> {
    try {
      loggingModule.debug('Initializing audio module');

      // Создаем аудио контекст
      // Определяем конструктор AudioContext с поддержкой префиксов
      const AudioContextConstructor =
        window.AudioContext ||
        (window as any).webkitAudioContext ||
        (window as any).webkitAudioContext;
      this.audioContext = new (
        AudioContextConstructor as typeof AudioContext
      )();
      loggingModule.debug('Audio context created');

      // Запрашиваем доступ к микрофону
      loggingModule.debug('Requesting microphone access');
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: config?.echoCancellation ?? true,
          noiseSuppression: config?.noiseSuppression ?? true,
          autoGainControl: config?.autoGainControl ?? true,
          sampleRate: config?.sampleRate,
          channelCount: config?.channelCount,
        },
      });
      loggingModule.info('Microphone access granted');

      return this.mediaStream;
    } catch (error) {
      loggingModule.error(
        `Failed to initialize audio: ${(error as Error).message}`,
      );
      throw new Error(
        `Failed to initialize audio: ${(error as Error).message}`,
      );
    }
  }

  async startRecording(
    stream: MediaStream,
    config?: RecordingConfig,
  ): Promise<void> {
    try {
      if (!stream) {
        loggingModule.error('Audio stream is required to start recording');
        throw new Error('Audio stream is required to start recording');
      }

      loggingModule.debug('Starting audio recording');

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: config?.mimeType || 'audio/webm',
        audioBitsPerSecond: config?.audioBitsPerSecond || 128000,
      });
      loggingModule.debug(
        `MediaRecorder created with mimeType: ${this.mediaRecorder.mimeType}`,
      );

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          // loggingModule.debug(`Audio chunk received: ${event.data.size} bytes`); // trace level not available
        }
      };

      this.mediaRecorder.start();
      loggingModule.info('Recording started');
    } catch (error) {
      loggingModule.error(
        `Failed to start recording: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        loggingModule.debug('Stopping audio recording');

        if (!this.mediaRecorder) {
          loggingModule.error('No active recording to stop');
          reject(new Error('No active recording to stop'));
          return;
        }

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, {
            type: this.mediaRecorder?.mimeType || 'audio/webm',
          });
          loggingModule.info(
            `Recording stopped, created blob with ${this.audioChunks.length} chunks`,
          );
          resolve(audioBlob);
        };

        this.mediaRecorder.stop();
      } catch (error) {
        loggingModule.error(
          `Failed to stop recording: ${(error as Error).message}`,
        );
        reject(error);
      }
    });
  }

  async pauseRecording(): Promise<void> {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.pause();
        loggingModule.info('Recording paused');
      }
    } catch (error) {
      loggingModule.error(
        `Failed to pause recording: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async resumeRecording(): Promise<void> {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
        loggingModule.info('Recording resumed');
      }
    } catch (error) {
      loggingModule.error(
        `Failed to resume recording: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  getRecordingState(): string {
    const state = this.mediaRecorder?.state || 'inactive';
    loggingModule.debug(`Current recording state: ${state}`);
    return state;
  }

  async cleanup(): Promise<void> {
    try {
      loggingModule.debug('Cleaning up audio module resources');

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
        loggingModule.debug('Stopped media recorder');
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => {
          track.stop();
          // loggingModule.debug("Stopped media track"); // trace level not available
        });
        this.mediaStream = null;
      }

      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
        loggingModule.debug('Closed audio context');
        this.audioContext = null;
      }

      loggingModule.info('Audio module cleaned up');
    } catch (error) {
      loggingModule.error(
        `Error during audio module cleanup: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}

// Экземпляр модуля
export const audioModule = new AudioModule();
