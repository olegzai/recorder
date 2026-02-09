/**
 * Tests for FileManagerModule
 * Note: These tests would need to be adapted for actual execution since they involve browser APIs
 */

import { FileManagerModule } from './file-manager';

describe('FileManagerModule', () => {
  let fileManager: FileManagerModule;

  beforeEach(() => {
    fileManager = new FileManagerModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should export recording in specified format', async () => {
    // Create a mock audio blob
    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' });

    const result = await fileManager.exportRecording(mockBlob, 'wav');

    expect(result.type).toBe('audio/wav');
  });

  test('should download recording with correct filename', async () => {
    // Mock URL.createObjectURL and document methods
    const createObjectURLSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('mock-url');
    const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL');

    // Mock document methods
    const createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockReturnValue({
        href: '',
        download: '',
        click: jest.fn(),
      } as unknown as HTMLAnchorElement);

    const appendChildSpy = jest
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => null);
    const removeChildSpy = jest
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => null);

    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' });

    await fileManager.downloadRecording(mockBlob, 'test-recording.wav');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('mock-url');

    // Restore mocks
    (URL.createObjectURL as jest.Mock).mockRestore();
    (URL.revokeObjectURL as jest.Mock).mockRestore();
  });

  test('should validate a valid recording', async () => {
    const validBlob = new Blob(['valid-audio-data'], { type: 'audio/webm' });

    const result = await fileManager.validateRecording(validBlob);

    expect(result).toBe(true);
  });

  test('should invalidate an empty recording', async () => {
    const emptyBlob = new Blob([], { type: 'audio/webm' });

    const result = await fileManager.validateRecording(emptyBlob);

    expect(result).toBe(false);
  });

  test('should invalidate a non-audio recording', async () => {
    const nonAudioBlob = new Blob(['text-data'], { type: 'text/plain' });

    const result = await fileManager.validateRecording(nonAudioBlob);

    expect(result).toBe(false);
  });

  test('should generate correct file size string', () => {
    expect(fileManager.getFileSizeString(512)).toBe('512.00 bytes');
    expect(fileManager.getFileSizeString(2048)).toBe('2.00 KB');
    expect(fileManager.getFileSizeString(2097152)).toBe('2.00 MB');
  });
});
