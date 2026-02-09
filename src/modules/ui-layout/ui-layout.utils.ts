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
 * Format a date for display in the UI
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

/**
 * Create a URL for a blob that can be used as an audio source
 */
export function createAudioUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke a URL created with createAudioUrl to free up memory
 */
export function revokeAudioUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Show a notification to the user
 */
export function showNotification(
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
): void {
  // In a real implementation, this would show a visual notification
  // For now, we'll just log it to the console
  if (type === 'success') {
    console.info(`Notification (${type}): ${message}`);
  } else if (type === 'warning') {
    console.warn(`Notification (${type}): ${message}`);
  } else {
    console[type](`Notification (${type}): ${message}`);
  }
}

/**
 * Confirm an action with the user
 */
export async function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    // In a real implementation, this would show a modal dialog
    // For now, we'll use the browser's confirm dialog
    resolve(confirm(message));
  });
}

/**
 * Get the appropriate icon for an audio format
 */
export function getAudioFormatIcon(format: string): string {
  const icons: { [key: string]: string } = {
    wav: '🎵',
    mp3: '🔊',
    ogg: '🎶',
    webm: '🎤',
  };

  return icons[format.toLowerCase()] || '🎵';
}

/**
 * Sanitize text for safe insertion into HTML
 */
export function sanitizeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
