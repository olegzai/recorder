import type { RecordingMetadata } from '../file-manager/file-manager.types';

const RECORDINGS_STORE_KEY = 'recorder_recordings';
const METADATA_STORE_KEY = 'recorder_metadata';

interface RecordingStore {
  [id: string]: {
    id: string;
    blob: Blob;
    metadata: RecordingMetadata;
  };
}

/**
 * StorageModule handles client-side storage using localStorage and IndexedDB
 */
export class StorageModule {
  private db: IDBDatabase | null = null;
  private dbName = 'RecorderDB';
  private dbVersion = 1;
  private objectStoreName = 'recordings';

  /**
   * Initialize the storage module
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported, falling back to localStorage');
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        // Still resolve since we can fall back to localStorage
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.objectStoreName)) {
          const objectStore = db.createObjectStore(this.objectStoreName, {
            keyPath: 'id',
          });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('language', 'metadata.language', {
            unique: false,
          });
        }
      };
    });
  }

  /**
   * Save a recording to storage
   */
  async saveRecording(
    blob: Blob,
    metadata: RecordingMetadata,
  ): Promise<string> {
    const id = this.generateId();

    // Save metadata to localStorage
    const metadataStore = this.getMetadataStore();
    const metadataWithId = {
      ...metadata,
      id,
      timestamp: metadata.timestamp || Date.now(),
    };

    metadataStore[id] = metadataWithId;
    this.saveMetadataStore(metadataStore);

    // Save blob to IndexedDB if available, otherwise to localStorage as base64
    if (this.db) {
      await this.saveBlobToIndexedDB(id, blob, metadata);
    } else {
      await this.saveBlobToLocalStorage(id, blob);
    }

    return id;
  }

  /**
   * Retrieve a recording by ID
   */
  async getRecording(
    id: string,
  ): Promise<{ blob: Blob; metadata: RecordingMetadata } | null> {
    // Get metadata from localStorage
    const metadataStore = this.getMetadataStore();
    const metadata = metadataStore[id];

    if (!metadata) {
      return null;
    }

    // Get blob from storage
    let blob: Blob | null = null;

    if (this.db) {
      blob = await this.getBlobFromIndexedDB(id);
    } else {
      blob = await this.getBlobFromLocalStorage(id);
    }

    if (!blob) {
      return null;
    }

    return { blob, metadata };
  }

  /**
   * Get all recordings
   */
  async getAllRecordings(): Promise<
    Array<{ id: string; blob: Blob; metadata: RecordingMetadata }>
  > {
    const metadataStore = this.getMetadataStore();
    const recordings: Array<{
      id: string;
      blob: Blob;
      metadata: RecordingMetadata;
    }> = [];

    for (const id in metadataStore) {
      const recording = await this.getRecording(id);
      if (recording) {
        recordings.push({ id, ...recording });
      }
    }

    // Sort by timestamp, newest first
    recordings.sort(
      (a, b) => (b.metadata.timestamp || 0) - (a.metadata.timestamp || 0),
    );

    return recordings;
  }

  /**
   * Delete a recording
   */
  async deleteRecording(id: string): Promise<void> {
    // Remove from localStorage metadata store
    const metadataStore = this.getMetadataStore();
    delete metadataStore[id];
    this.saveMetadataStore(metadataStore);

    // Remove from IndexedDB or localStorage
    if (this.db) {
      await this.deleteBlobFromIndexedDB(id);
    } else {
      await this.deleteBlobFromLocalStorage(id);
    }
  }

  /**
   * Clear all recordings
   */
  async clearAllRecordings(): Promise<void> {
    // Clear localStorage metadata
    localStorage.removeItem(METADATA_STORE_KEY);

    // Clear IndexedDB or localStorage blobs
    if (this.db) {
      await this.clearIndexedDB();
    } else {
      await this.clearLocalStorageBlobs();
    }
  }

  /**
   * Perform automatic cleanup based on retention period
   */
  async performCleanup(
    retentionDays: number | 'never' | 'clear',
  ): Promise<number> {
    if (retentionDays === 'clear') {
      await this.clearAllRecordings();
      return -1; // Indicates all recordings were cleared
    }

    if (retentionDays === 'never') {
      return 0; // No cleanup performed
    }

    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const metadataStore = this.getMetadataStore();
    const idsToDelete: string[] = [];

    // Find recordings older than cutoff time
    for (const id in metadataStore) {
      const metadata = metadataStore[id];
      if (metadata && metadata.timestamp && metadata.timestamp < cutoffTime) {
        idsToDelete.push(id);
      }
    }

    // Delete old recordings
    for (const id of idsToDelete) {
      await this.deleteRecording(id);
    }

    return idsToDelete.length;
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{ used: number; quota: number | null }> {
    // Estimate used storage by calculating size of stored recordings
    const recordings = await this.getAllRecordings();
    const used = recordings.reduce(
      (sum, rec) => sum + (rec.metadata.size || 0),
      0,
    );

    // Try to get storage quota if available
    let quota: number | null = null;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota || null;
      } catch (e) {
        // Quota estimation not available
      }
    }

    return { used, quota };
  }

  // Private helper methods for localStorage
  private getMetadataStore(): { [id: string]: RecordingMetadata } {
    const storeStr = localStorage.getItem(METADATA_STORE_KEY) || '{}';
    try {
      return JSON.parse(storeStr);
    } catch (e) {
      console.error('Error parsing metadata store:', e);
      return {};
    }
  }

  private saveMetadataStore(store: { [id: string]: RecordingMetadata }): void {
    try {
      localStorage.setItem(METADATA_STORE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error('Error saving metadata store:', e);
    }
  }

  private async saveBlobToLocalStorage(id: string, blob: Blob): Promise<void> {
    // Convert blob to base64 for localStorage
    const base64 = await this.blobToBase64(blob);
    localStorage.setItem(`${RECORDINGS_STORE_KEY}_${id}`, base64);
  }

  private async getBlobFromLocalStorage(id: string): Promise<Blob | null> {
    const base64 = localStorage.getItem(`${RECORDINGS_STORE_KEY}_${id}`);
    if (!base64) {
      return null;
    }

    try {
      return this.base64ToBlob(base64, 'audio/webm'); // Default to webm
    } catch (e) {
      console.error('Error converting base64 to blob:', e);
      return null;
    }
  }

  private async deleteBlobFromLocalStorage(id: string): Promise<void> {
    localStorage.removeItem(`${RECORDINGS_STORE_KEY}_${id}`);
  }

  private async clearLocalStorageBlobs(): Promise<void> {
    // Find and remove all recording entries
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(RECORDINGS_STORE_KEY)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  // Private helper methods for IndexedDB
  private async saveBlobToIndexedDB(
    id: string,
    blob: Blob,
    metadata: RecordingMetadata,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const transaction = this.db.transaction(
        [this.objectStoreName],
        'readwrite',
      );
      const objectStore = transaction.objectStore(this.objectStoreName);

      const record = {
        id,
        blob,
        metadata,
      };

      const request = objectStore.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getBlobFromIndexedDB(id: string): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null);
        return;
      }

      const transaction = this.db.transaction(
        [this.objectStoreName],
        'readonly',
      );
      const objectStore = transaction.objectStore(this.objectStoreName);

      const request = objectStore.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async deleteBlobFromIndexedDB(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const transaction = this.db.transaction(
        [this.objectStoreName],
        'readwrite',
      );
      const objectStore = transaction.objectStore(this.objectStoreName);

      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const transaction = this.db.transaction(
        [this.objectStoreName],
        'readwrite',
      );
      const objectStore = transaction.objectStore(this.objectStoreName);

      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utility methods
  private generateId(): string {
    return `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const parts = reader.result.split(',');
          resolve(parts[1] || ''); // Remove data URL prefix
        } else {
          reject(new Error('Could not convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const sliceSize = 1024;
    const byteCharacters = atob(base64);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset];
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }

    return new Blob(byteArrays, {
      type: contentType || 'application/octet-stream',
    });
  }
}

// Default instance
export const storageModule = new StorageModule();
