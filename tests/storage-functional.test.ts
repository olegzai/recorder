import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageModule } from '../src/modules/storage/storage';
import { FixedStorageModule } from '../src/modules/storage/FixedStorageModule';

// Test the storage functionality directly
describe('Storage Module Tests', () => {
  let storage: FixedStorageModule;

  beforeEach(async () => {
    storage = new FixedStorageModule();
    await storage.initialize();
  });

  afterEach(async () => {
    // Clear all recordings after each test
    await storage.clearAllRecordings();
  });

  it('should save and retrieve a recording properly', async () => {
    // Create a mock audio blob
    const audioBlob = new Blob(['fake-audio-data'], { type: 'audio/webm' });
    
    // Create metadata
    const metadata = {
      title: 'Test Recording',
      timestamp: Date.now(),
      duration: 10,
      format: 'webm',
      language: 'en'
    };

    // Save the recording
    const id = await storage.saveRecording(audioBlob, metadata);

    // Verify the ID was returned
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id).toContain('rec-');

    // Retrieve all recordings
    const allRecordings = await storage.getAllRecordings();
    
    // Verify the recording was saved
    expect(allRecordings).toHaveLength(1);
    expect(allRecordings[0]).toHaveProperty('id');
    expect(allRecordings[0]).toHaveProperty('blob');
    expect(allRecordings[0]).toHaveProperty('metadata');
    expect(allRecordings[0].id).toBe(id);
    expect(allRecordings[0].metadata.title).toBe('Test Recording');
    expect(allRecordings[0].metadata.format).toBe('webm');
  });

  it('should handle multiple recordings and sort them by timestamp', async () => {
    // Create multiple mock audio blobs
    const audioBlob1 = new Blob(['fake-audio-data-1'], { type: 'audio/webm' });
    const audioBlob2 = new Blob(['fake-audio-data-2'], { type: 'audio/webm' });
    
    const timestamp1 = Date.now() - 10000; // 10 seconds ago
    const timestamp2 = Date.now(); // now
    
    const metadata1 = {
      title: 'Older Recording',
      timestamp: timestamp1,
      duration: 10,
      format: 'webm',
      language: 'en'
    };

    const metadata2 = {
      title: 'Newer Recording',
      timestamp: timestamp2,
      duration: 15,
      format: 'mp3',
      language: 'ru'
    };

    // Save both recordings
    const id1 = await storage.saveRecording(audioBlob1, metadata1);
    const id2 = await storage.saveRecording(audioBlob2, metadata2);

    // Verify both IDs were returned
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();

    // Retrieve all recordings
    const allRecordings = await storage.getAllRecordings();
    
    // Verify both recordings were saved
    expect(allRecordings).toHaveLength(2);
    
    // Check that they are sorted by timestamp (newest first)
    expect(allRecordings[0].metadata.title).toBe('Newer Recording');
    expect(allRecordings[1].metadata.title).toBe('Older Recording');
  });

  it('should delete a recording properly', async () => {
    // Create mock audio blob
    const audioBlob = new Blob(['fake-audio-data'], { type: 'audio/webm' });
    
    const metadata = {
      title: 'Test Recording to Delete',
      timestamp: Date.now(),
      duration: 10,
      format: 'webm',
      language: 'en'
    };

    // Save the recording
    const id = await storage.saveRecording(audioBlob, metadata);
    expect(id).toBeDefined();

    // Verify it was saved
    let allRecordings = await storage.getAllRecordings();
    expect(allRecordings).toHaveLength(1);

    // Delete the recording
    await storage.deleteRecording(id);

    // Verify it was deleted
    allRecordings = await storage.getAllRecordings();
    expect(allRecordings).toHaveLength(0);
  });

  it('should clear all recordings', async () => {
    // Create multiple mock audio blobs
    const audioBlob1 = new Blob(['fake-audio-data-1'], { type: 'audio/webm' });
    const audioBlob2 = new Blob(['fake-audio-data-2'], { type: 'audio/webm' });
    
    const metadata1 = {
      title: 'First Recording',
      timestamp: Date.now(),
      duration: 10,
      format: 'webm',
      language: 'en'
    };

    const metadata2 = {
      title: 'Second Recording',
      timestamp: Date.now() + 1000,
      duration: 15,
      format: 'mp3',
      language: 'ru'
    };

    // Save both recordings
    await storage.saveRecording(audioBlob1, metadata1);
    await storage.saveRecording(audioBlob2, metadata2);

    // Verify they were saved
    let allRecordings = await storage.getAllRecordings();
    expect(allRecordings).toHaveLength(2);

    // Clear all recordings
    await storage.clearAllRecordings();

    // Verify they were cleared
    allRecordings = await storage.getAllRecordings();
    expect(allRecordings).toHaveLength(0);
  });

  it('should handle metadata correctly', async () => {
    // Create a mock audio blob
    const audioBlob = new Blob(['fake-audio-data'], { type: 'audio/webm' });
    
    // Create metadata with all possible fields
    const metadata = {
      title: 'Complete Metadata Test',
      timestamp: Date.now(),
      duration: 45,
      format: 'ogg',
      language: 'es',
      transcription: 'This is a test transcription',
      translation: 'Esta es una transcripción de prueba'
    };

    // Save the recording
    const id = await storage.saveRecording(audioBlob, metadata);

    // Retrieve the recording
    const allRecordings = await storage.getAllRecordings();
    
    // Verify all metadata was preserved
    expect(allRecordings).toHaveLength(1);
    const recording = allRecordings[0];
    expect(recording.metadata.title).toBe('Complete Metadata Test');
    expect(recording.metadata.duration).toBe(45);
    expect(recording.metadata.format).toBe('ogg');
    expect(recording.metadata.language).toBe('es');
    expect(recording.metadata.transcription).toBe('This is a test transcription');
    expect(recording.metadata.translation).toBe('Esta es una transcripción de prueba');
  });
});