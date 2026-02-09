// Типы данных для приложения

export interface Recording {
  id: string;
  title: string;
  timestamp: number;
  duration: number;
  format: string;
  size?: number;
  url: string;
  language?: string;
  transcription?: string;
  translation?: string;
}

export interface Settings {
  sampleRate: number;
  bitrate: number;
  audioFormat: string;
  transcriptionLang: 'en' | 'ru' | 'uk' | string;
  translationLang: 'en' | 'ru' | 'uk' | string;
  retentionPeriod: string;
}

export interface Plugins {
  recorderEnabled: boolean;
  transcriptionEnabled: boolean;
  translationEnabled: boolean;
  voiceoverEnabled: boolean;
  historyEnabled: boolean;
  settingsEnabled: boolean;
}

export interface AudioConfig {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export interface RecordingConfig {
  mimeType?: string;
  audioBitsPerSecond?: number;
  sampleRate?: number;
  channelCount?: number;
}

export interface FileExportConfig {
  sampleRate?: number;
  audioBitsPerSecond?: number;
  filename?: string;
}
