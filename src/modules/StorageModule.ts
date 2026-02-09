// Модуль для хранения данных
import type { Recording } from '../types';
import { loggingModule } from './logging';

class StorageModule {
  private readonly RECORDINGS_KEY = 'recorder_recordings';

  async saveRecording(recording: Recording): Promise<void> {
    try {
      loggingModule.debug(`Saving recording: ${recording.id}`);

      // Получаем существующие записи
      const recordings = await this.getAllRecordings();

      // Добавляем новую запись в начало массива (самые новые первыми)
      recordings.unshift(recording);

      // Сохраняем в localStorage
      localStorage.setItem(this.RECORDINGS_KEY, JSON.stringify(recordings));

      loggingModule.info(`Recording saved: ${recording.id}`);
    } catch (error) {
      loggingModule.error(
        `Failed to save recording: ${(error as Error).message}`,
      );
      throw new Error(`Failed to save recording: ${(error as Error).message}`);
    }
  }

  async getAllRecordings(): Promise<Recording[]> {
    try {
      loggingModule.debug('Loading all recordings from storage');

      const recordingsJson = localStorage.getItem(this.RECORDINGS_KEY);
      const recordings = recordingsJson ? JSON.parse(recordingsJson) : [];

      loggingModule.info(`Loaded ${recordings.length} recordings from storage`);
      return recordings;
    } catch (error) {
      loggingModule.error(
        `Error loading recordings: ${(error as Error).message}`,
      );
      return [];
    }
  }

  async deleteRecording(id: string): Promise<void> {
    try {
      loggingModule.debug(`Deleting recording: ${id}`);

      const recordings = await this.getAllRecordings();
      const filteredRecordings = recordings.filter((rec) => rec.id !== id);
      localStorage.setItem(
        this.RECORDINGS_KEY,
        JSON.stringify(filteredRecordings),
      );

      loggingModule.info(`Recording deleted: ${id}`);
    } catch (error) {
      loggingModule.error(
        `Failed to delete recording: ${(error as Error).message}`,
      );
      throw new Error(
        `Failed to delete recording: ${(error as Error).message}`,
      );
    }
  }

  async clearAllRecordings(): Promise<void> {
    try {
      loggingModule.debug('Clearing all recordings');

      localStorage.removeItem(this.RECORDINGS_KEY);

      loggingModule.info('All recordings cleared');
    } catch (error) {
      loggingModule.error(
        `Failed to clear recordings: ${(error as Error).message}`,
      );
      throw new Error(
        `Failed to clear recordings: ${(error as Error).message}`,
      );
    }
  }

  async performCleanup(
    retentionDays: number | 'never' | 'clear',
  ): Promise<number> {
    if (retentionDays === 'clear') {
      await this.clearAllRecordings();
      loggingModule.info('All recordings cleared due to retention policy');
      return -1; // Все записи удалены
    }

    if (retentionDays === 'never') {
      loggingModule.debug('Retention policy set to never delete');
      return 0; // Ничего не удалено
    }

    try {
      loggingModule.debug(
        `Performing cleanup with retention period: ${retentionDays} days`,
      );

      const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
      const recordings = await this.getAllRecordings();
      const recordingsToKeep = recordings.filter(
        (rec) => rec.timestamp >= cutoffTime,
      );
      const deletedCount = recordings.length - recordingsToKeep.length;

      localStorage.setItem(
        this.RECORDINGS_KEY,
        JSON.stringify(recordingsToKeep),
      );

      loggingModule.info(
        `Cleanup completed: ${deletedCount} recordings deleted`,
      );
      return deletedCount;
    } catch (error) {
      loggingModule.error(
        `Failed to perform cleanup: ${(error as Error).message}`,
      );
      throw new Error(`Failed to perform cleanup: ${(error as Error).message}`);
    }
  }
}

// Экземпляр модуля
export const storageModule = new StorageModule();
