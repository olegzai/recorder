import { encodingModule } from '../encoding';
import type { FileExportConfig, RecordingMetadata } from './file-manager.types';

/**
 * FileManagerModule handles file operations and recording exports
 */
export class FileManagerModule {
  /**
   * Export a recording in the specified format
   */
  async exportRecording(
    blob: Blob,
    format: string,
    metadata?: RecordingMetadata,
    config?: FileExportConfig,
  ): Promise<Blob> {
    try {
      // Validate inputs
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('Invalid recording blob provided');
      }

      if (!format) {
        throw new Error('Export format not specified');
      }

      // Encode the recording to the requested format
      const encodingConfig = {} as any;
      if (config?.sampleRate !== undefined)
        encodingConfig.sampleRate = config.sampleRate;
      if (config?.audioBitsPerSecond !== undefined)
        encodingConfig.audioBitsPerSecond = config.audioBitsPerSecond;

      const encodedBlob = await encodingModule.encode(
        blob,
        format as any,
        encodingConfig,
      );

      return encodedBlob;
    } catch (error) {
      throw new Error(
        `Failed to export recording: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Download a recording file to the user's device
   */
  async downloadRecording(
    blob: Blob,
    filename: string,
    metadata?: RecordingMetadata,
  ): Promise<void> {
    try {
      // Validate inputs
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('Invalid recording blob provided');
      }

      if (!filename) {
        filename = this.generateFilename(metadata);
      }

      // Create object URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(
        `Failed to download recording: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Generate a filename for the recording
   */
  private generateFilename(metadata?: RecordingMetadata): string {
    const timestamp = metadata?.timestamp
      ? new Date(metadata.timestamp)
      : new Date();
    const dateStr = timestamp.toISOString().slice(0, 19).replace(/:/g, '-');
    const format = metadata?.format || 'webm';

    return `recording_${dateStr}.${format}`;
  }

  /**
   * Validate a recording file
   */
  async validateRecording(blob: Blob): Promise<boolean> {
    try {
      if (!blob || !(blob instanceof Blob)) {
        return false;
      }

      // Check if blob has content
      if (blob.size === 0) {
        return false;
      }

      // Check if blob type is an audio type
      if (!blob.type.startsWith('audio/')) {
        return false;
      }

      // Additional validation could be added here
      // For example, checking if the file can be loaded as audio

      return true;
    } catch (error) {
      console.error('Error validating recording:', error);
      return false;
    }
  }

  /**
   * Get file size in human-readable format
   */
  getFileSizeString(sizeInBytes: number): string {
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// Default instance
export const fileManagerModule = new FileManagerModule();
