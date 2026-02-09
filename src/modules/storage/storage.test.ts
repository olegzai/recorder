/**
 * Tests for StorageModule
 * Note: These tests would need to be adapted for actual execution since they involve browser APIs
 */

import { StorageModule } from './storage';

describe('StorageModule', () => {
  let storage: StorageModule;

  beforeEach(async () => {
    storage = new StorageModule();

    // Clear any existing storage
    localStorage.clear();

    // Initialize the storage module
    await storage.initialize();
  });

  afterEach(async () => {
    jest.clearAllMocks();

    // Clean up any stored data
    await storage.clearAllRecordings();
  });

  test('should initialize correctly', async () => {
    // Initialization should complete without errors
    await expect(storage.initialize()).resolves.toBeUndefined();
  });

  test('should save and retrieve a recording', async () => {
    const mockBlob = new Blob(['test-audio-data'], { type: 'audio/webm' });
    const metadata = {
      title: 'Test Recording',
      timestamp: Date.now(),
      duration: 10,
      format: 'webm',
      language: 'en',
    };

    const id = await storage.saveRecording(mockBlob, metadata);

    const retrieved = await storage.getRecording(id);

    expect(retrieved).not.toBeNull();
    expect(retrieved!.metadata.title).toBe('Test Recording');
    expect(retrieved!.blob.size).toBeGreaterThan(0);
  });

  test('should get all recordings', async () => {
    const mockBlob1 = new Blob(['test-audio-data-1'], { type: 'audio/webm' });
    const metadata1 = {
      title: 'Test Recording 1',
      timestamp: Date.now() - 10000, // 10 seconds ago
      duration: 10,
      format: 'webm',
      language: 'en',
    };

    const mockBlob2 = new Blob(['test-audio-data-2'], { type: 'audio/webm' });
    const metadata2 = {
      title: 'Test Recording 2',
      timestamp: Date.now(), // now
      duration: 15,
      format: 'webm',
      language: 'en',
    };

    await storage.saveRecording(mockBlob1, metadata1);
    await storage.saveRecording(mockBlob2, metadata2);

    const allRecordings = await storage.getAllRecordings();

    expect(allRecordings.length).toBeGreaterThanOrEqual(2);

    // The most recent recording should be first
    if (allRecordings.length >= 2) {
      expect(allRecordings[0].metadata.title).toBe('Test Recording 2');
      expect(allRecordings[1].metadata.title).toBe('Test Recording 1');
    }
  });

  test('should delete a recording', async () => {
    const mockBlob = new Blob(['test-audio-data'], { type: 'audio/webm' });
    const metadata = {
      title: 'Test Recording',
      timestamp: Date.now(),
      duration: 10,
      format: 'webm',
      language: 'en',
    };

    const id = await storage.saveRecording(mockBlob, metadata);

    // Verify it was saved
    const retrievedBeforeDelete = await storage.getRecording(id);
    expect(retrievedBeforeDelete).not.toBeNull();

    // Delete the recording
    await storage.deleteRecording(id);

    // Verify it was deleted
    const retrievedAfterDelete = await storage.getRecording(id);
    expect(retrievedAfterDelete).toBeNull();
  });

  test('should clear all recordings', async () => {
    const mockBlob1 = new Blob(['test-audio-data-1'], { type: 'audio/webm' });
    const metadata1 = {
      title: 'Test Recording 1',
      timestamp: Date.now(),
      duration: 10,
      format: 'webm',
      language: 'en',
    };

    const mockBlob2 = new Blob(['test-audio-data-2'], { type: 'audio/webm' });
    const metadata2 = {
      title: 'Test Recording 2',
      timestamp: Date.now(),
      duration: 15,
      format: 'webm',
      language: 'en',
    };

    await storage.saveRecording(mockBlob1, metadata1);
    await storage.saveRecording(mockBlob2, metadata2);

    // Verify recordings were saved
    const recordingsBeforeClear = await storage.getAllRecordings();
    expect(recordingsBeforeClear.length).toBeGreaterThanOrEqual(2);

    // Clear all recordings
    await storage.clearAllRecordings();

    // Verify all recordings were cleared
    const recordingsAfterClear = await storage.getAllRecordings();
    expect(recordingsAfterClear.length).toBe(0);
  });

  test('should perform cleanup based on retention period', async () => {
    const mockBlob1 = new Blob(['test-audio-data-1'], { type: 'audio/webm' });
    const metadata1 = {
      title: 'Old Recording',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      duration: 10,
      format: 'webm',
      language: 'en',
    };

    const mockBlob2 = new Blob(['test-audio-data-2'], { type: 'audio/webm' });
    const metadata2 = {
      title: 'New Recording',
      timestamp: Date.now(), // now
      duration: 15,
      format: 'webm',
      language: 'en',
    };

    await storage.saveRecording(mockBlob1, metadata1);
    await storage.saveRecording(mockBlob2, metadata2);

    // Perform cleanup for recordings older than 1 day
    const deletedCount = await storage.performCleanup(1);

    expect(deletedCount).toBe(1);

    const allRecordings = await storage.getAllRecordings();
    expect(allRecordings.length).toBe(1);
    expect(allRecordings[0].metadata.title).toBe('New Recording');
  });
});
