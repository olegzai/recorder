import type { RecordingMetadata } from '../file-manager/file-manager.types';

const RECORDINGS_STORE_KEY = 'recorder_recordings';
const METADATA_STORE_KEY = 'recorder_metadata';
const METADATA_INDEX_KEY = 'recorder_metadata_index'; // Stores only IDs and timestamps for sorting

/**
 * Fixed StorageModule handles client-side storage using localStorage and IndexedDB
 * This version fixes the quota exceeded issue by storing metadata separately
 */
export class FixedStorageModule {
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

    // Prepare minimal metadata with only essential fields to prevent quota issues
    const minimalMetadata = {
      id,
      title: (metadata.title || `Recording ${new Date().toLocaleString()}`).substring(0, 200), // Limit title
      timestamp: metadata.timestamp || Date.now(),
      duration: metadata.duration || 0,
      format: metadata.format || 'webm',
      language: metadata.language || 'en',
      // Only store very short transcriptions/translations or truncate heavily
      transcription: metadata.transcription ? this.truncateString(metadata.transcription, 200) : undefined, // Very short
      translation: metadata.translation ? this.truncateString(metadata.translation, 200) : undefined, // Very short
    };

    // Save metadata to localStorage with its own key
    const metadataKey = `${METADATA_STORE_KEY}_${id}`;
    try {
      const serializedMetadata = JSON.stringify(minimalMetadata);
      // Check the size before saving
      const sizeInBytes = new Blob([serializedMetadata]).size;
      if (sizeInBytes > 4000) { // Leave buffer for localStorage limits (usually 5-10MB but some browsers have lower limits)
        console.warn(`Metadata for ${id} is too large (${sizeInBytes} bytes), truncating further`);
        // Further truncate if needed
        minimalMetadata.title = minimalMetadata.title.substring(0, 100);
        minimalMetadata.transcription = minimalMetadata.transcription ? this.truncateString(minimalMetadata.transcription, 50) : undefined;
        minimalMetadata.translation = minimalMetadata.translation ? this.truncateString(minimalMetadata.translation, 50) : undefined;
      }
      
      localStorage.setItem(metadataKey, JSON.stringify(minimalMetadata));
    } catch (e) {
      console.error('Error saving metadata to localStorage:', e);
      console.error('Metadata size was approximately:', new Blob([JSON.stringify(minimalMetadata)]).size, 'bytes');
      throw new Error(`Failed to save recording metadata: ${(e as Error).message}`);
    }

    // Add the ID to the index for sorting
    this.addToMetadataIndex(id, minimalMetadata.timestamp);

    // Save blob to IndexedDB if available, otherwise to localStorage as base64
    if (this.db) {
      await this.saveBlobToIndexedDB(id, blob, minimalMetadata);
    } else {
      await this.saveBlobToLocalStorage(id, blob);
    }

    return id;
  }

  /**
   * Truncate string to prevent localStorage quota exceeded errors
   */
  private truncateString(str: string | undefined, maxLength: number): string | undefined {
    if (!str) return str;
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  /**
   * Retrieve a recording by ID
   */
  async getRecording(
    id: string,
  ): Promise<{ blob: Blob; metadata: RecordingMetadata } | null> {
    // Get metadata from localStorage
    const metadataKey = `${METADATA_STORE_KEY}_${id}`;
    const metadataJson = localStorage.getItem(metadataKey);
    let metadata = metadataJson ? JSON.parse(metadataJson) : null;

    if (!metadata) {
      return null;
    }

    // Ensure metadata conforms to RecordingMetadata interface
    metadata = {
      id: metadata.id,
      title: metadata.title,
      timestamp: metadata.timestamp,
      duration: metadata.duration,
      format: metadata.format,
      language: metadata.language,
      transcription: metadata.transcription,
      translation: metadata.translation,
    };

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
    // Get the sorted list of IDs from the index
    const index = this.getMetadataIndex();
    const recordings: Array<{
      id: string;
      blob: Blob;
      metadata: RecordingMetadata;
    }> = [];

    // Process recordings in the correct order (newest first)
    for (const id of index.sortedIds) {
      const recording = await this.getRecording(id);
      if (recording) {
        recordings.push({ id, ...recording });
      }
    }

    return recordings;
  }

  /**
   * Delete a recording
   */
  async deleteRecording(id: string): Promise<void> {
    // Remove metadata from localStorage
    const metadataKey = `${METADATA_STORE_KEY}_${id}`;
    localStorage.removeItem(metadataKey);

    // Remove from index
    this.removeFromMetadataIndex(id);

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
    // Get all IDs from the index
    const index = this.getMetadataIndex();
    
    // Remove all metadata entries
    for (const id of index.sortedIds) {
      const metadataKey = `${METADATA_STORE_KEY}_${id}`;
      localStorage.removeItem(metadataKey);
    }
    
    // Clear the index
    localStorage.removeItem(METADATA_INDEX_KEY);

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
    const index = this.getMetadataIndex();
    const idsToDelete: string[] = [];

    // Find recordings older than cutoff time
    for (const id of index.sortedIds) {
      const metadataKey = `${METADATA_STORE_KEY}_${id}`;
      const metadataJson = localStorage.getItem(metadataKey);
      if (metadataJson) {
        const metadata = JSON.parse(metadataJson);
        if (metadata && metadata.timestamp && metadata.timestamp < cutoffTime) {
          idsToDelete.push(id);
        }
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

  // Private helper methods for metadata index
  private getMetadataIndex(): { sortedIds: string[] } {
    const indexStr = localStorage.getItem(METADATA_INDEX_KEY) || '{"sortedIds":[]}';
    try {
      return JSON.parse(indexStr);
    } catch (e) {
      console.error('Error parsing metadata index:', e);
      return { sortedIds: [] };
    }
  }

  private addToMetadataIndex(id: string, timestamp: number): void {
    const index = this.getMetadataIndex();
    
    // Add the new ID with its timestamp
    index.sortedIds = [id, ...index.sortedIds]; // Add to the beginning for newest first
    
    // Sort by timestamp (newest first)
    const sortedIdsWithTimestamps = index.sortedIds.map(id => {
      const metadataKey = `${METADATA_STORE_KEY}_${id}`;
      const metadataJson = localStorage.getItem(metadataKey);
      const metadata = metadataJson ? JSON.parse(metadataJson) : null;
      return { id, timestamp: metadata?.timestamp || 0 };
    });
    
    sortedIdsWithTimestamps.sort((a, b) => b.timestamp - a.timestamp);
    index.sortedIds = sortedIdsWithTimestamps.map(item => item.id);
    
    try {
      localStorage.setItem(METADATA_INDEX_KEY, JSON.stringify(index));
    } catch (e) {
      console.error('Error saving metadata index:', e);
    }
  }

  private removeFromMetadataIndex(id: string): void {
    const index = this.getMetadataIndex();
    index.sortedIds = index.sortedIds.filter(existingId => existingId !== id);
    
    try {
      localStorage.setItem(METADATA_INDEX_KEY, JSON.stringify(index));
    } catch (e) {
      console.error('Error saving metadata index:', e);
    }
  }

  // Private helper methods for localStorage
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
export const fixedStorageModule = new FixedStorageModule();