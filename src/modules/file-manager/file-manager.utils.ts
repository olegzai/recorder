import type { RecordingMetadata } from './file-manager.types';

/**
 * Generate a unique ID for a recording
 */
export function generateRecordingId(): string {
  return `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format a duration in seconds to HH:MM:SS format
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return [h, m, s]
    .map((v) => v.toString().padStart(2, '0'))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
}

/**
 * Create metadata for a new recording
 */
export function createRecordingMetadata(
  blob: Blob,
  additionalData?: Partial<RecordingMetadata>,
): RecordingMetadata {
  return {
    timestamp: Date.now(),
    size: blob.size,
    format: blob.type.split('/')[1] || 'unknown',
    duration: 0, // Duration will be calculated when available
    ...additionalData,
  };
}

/**
 * Validate a filename by removing invalid characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove invalid characters for filenames
  return filename.replace(/[<>:"/\\|?*]/g, '_');
}

/**
 * Check if a file type is a valid audio format
 */
export function isValidAudioFormat(fileType: string): boolean {
  const validFormats = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'audio/webm',
  ];
  return validFormats.includes(fileType.toLowerCase());
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i];
}
