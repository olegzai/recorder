import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageModule } from '../src/modules/storage/storage';

describe('StorageModule Debug Tests', () => {
  let storage: StorageModule;

  beforeEach(async () => {
    storage = new StorageModule();
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

    console.log('Attempting to save recording...');
    const id = await storage.saveRecording(audioBlob, metadata);
    console.log(`Recording saved with ID: ${id}`);

    // Check if the recording was saved
    const allRecordings = await storage.getAllRecordings();
    console.log(`Total recordings after save: ${allRecordings.length}`);
    
    expect(allRecordings).toHaveLength(1);
    expect(allRecordings[0]).toHaveProperty('id');
    expect(allRecordings[0]).toHaveProperty('blob');
    expect(allRecordings[0]).toHaveProperty('metadata');
    expect(allRecordings[0].id).toBe(id);
    expect(allRecordings[0].metadata.title).toBe('Test Recording');
  });

  it('should handle multiple recordings', async () => {
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

    console.log('Saving first recording...');
    const id1 = await storage.saveRecording(audioBlob1, metadata1);
    console.log(`First recording saved with ID: ${id1}`);

    console.log('Saving second recording...');
    const id2 = await storage.saveRecording(audioBlob2, metadata2);
    console.log(`Second recording saved with ID: ${id2}`);

    // Check if both recordings were saved
    const allRecordings = await storage.getAllRecordings();
    console.log(`Total recordings after saving two: ${allRecordings.length}`);
    
    expect(allRecordings).toHaveLength(2);
    
    // Check that they are sorted by timestamp (newest first)
    expect(allRecordings[0].metadata.title).toBe('Second Recording');
    expect(allRecordings[1].metadata.title).toBe('First Recording');
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

    console.log('Saving recording to delete...');
    const id = await storage.saveRecording(audioBlob, metadata);
    console.log(`Recording saved with ID: ${id}`);

    // Verify it was saved
    let allRecordings = await storage.getAllRecordings();
    console.log(`Recordings before deletion: ${allRecordings.length}`);
    expect(allRecordings).toHaveLength(1);

    // Delete the recording
    console.log('Deleting recording...');
    await storage.deleteRecording(id);
    console.log('Recording deleted');

    // Verify it was deleted
    allRecordings = await storage.getAllRecordings();
    console.log(`Recordings after deletion: ${allRecordings.length}`);
    expect(allRecordings).toHaveLength(0);
  });
});