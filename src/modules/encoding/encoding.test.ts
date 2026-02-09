/**
 * Tests for EncodingModule
 * Note: These tests would need to be adapted for actual execution since they involve browser APIs
 */

import { EncodingModule } from './encoding';

describe('EncodingModule', () => {
  let encodingModule: EncodingModule;

  beforeEach(() => {
    encodingModule = new EncodingModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should encode to WAV format', async () => {
    // Create a mock audio blob
    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' });

    const result = await encodingModule.encode(mockBlob, 'wav');

    expect(result.type).toBe('audio/wav');
  });

  test('should encode to MP3 format', async () => {
    // Create a mock audio blob
    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' });

    const result = await encodingModule.encode(mockBlob, 'mp3');

    expect(result.type).toBe('audio/mp3');
  });

  test('should encode to OGG format', async () => {
    // Create a mock audio blob
    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' });

    const result = await encodingModule.encode(mockBlob, 'ogg');

    expect(result.type).toBe('audio/ogg');
  });

  test('should encode to WebM format', async () => {
    // Create a mock audio blob
    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/other' });

    const result = await encodingModule.encode(mockBlob, 'webm');

    expect(result.type).toBe('audio/webm');
  });

  test('should throw error for unsupported format', async () => {
    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' });

    await expect(
      encodingModule.encode(mockBlob, 'flac' as any),
    ).rejects.toThrow('Unsupported audio format: flac');
  });

  test('should handle encoding with custom config', async () => {
    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' });
    const config = { sampleRate: 22050, audioBitsPerSecond: 64000 };

    const result = await encodingModule.encode(mockBlob, 'wav', config);

    expect(result.type).toBe('audio/wav');
    // Note: Actual sample rate changes would require more complex implementation
  });
});
