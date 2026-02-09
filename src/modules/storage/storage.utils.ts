/**
 * Check if IndexedDB is supported in the current browser
 */
export function isIndexedDBSupported(): boolean {
  return !!window.indexedDB;
}

/**
 * Check if localStorage is supported in the current browser
 */
export function isLocalStorageSupported(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Format a date for display in the UI
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Calculate the age of a recording in days
 */
export function getRecordingAgeInDays(timestamp: number): number {
  const now = Date.now();
  const recordingTime = timestamp;
  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.floor((now - recordingTime) / msPerDay);
}

/**
 * Estimate the size of an object in bytes (approximate)
 */
export function estimateObjectSize(obj: any): number {
  const str = JSON.stringify(obj);
  return new Blob([str]).size;
}

/**
 * Check if there's enough storage space for a new recording
 */
export async function hasEnoughStorageSpace(
  requiredBytes: number,
): Promise<boolean> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const available = estimate.quota
        ? estimate.quota - (estimate.usage || 0)
        : Infinity;
      return available > requiredBytes * 2; // Require double the space as buffer
    } catch (e) {
      // If we can't determine available space, assume there's enough
      return true;
    }
  }

  // If storage estimation isn't available, assume there's enough space
  return true;
}
