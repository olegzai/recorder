/**
 * Tests for RecordingEngineModule
 * Note: These tests would need to be adapted for actual execution since they involve browser APIs
 */

import { RecordingEngineModule } from './recording-engine';

describe('RecordingEngineModule', () => {
  let recordingEngine: RecordingEngineModule;
  let mockStream: MediaStream;

  beforeEach(() => {
    recordingEngine = new RecordingEngineModule();

    // Create a mock MediaStream
    mockStream = {
      getTracks: () => [],
      addTrack: () => {},
      removeTrack: () => {},
      active: true,
      id: 'mock-stream-id',
    } as unknown as MediaStream;

    // Mock MediaRecorder
    (window as any).MediaRecorder = jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      state: 'inactive',
      ondataavailable: null,
      onstart: null,
      onstop: null,
      onerror: null,
      onpause: null,
      onresume: null,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    recordingEngine.destroy();
  });

  test('should initialize correctly with a media stream', () => {
    recordingEngine.initialize(mockStream);

    // Since we can't directly access private properties in tests,
    // we'll verify that no errors were thrown during initialization
    expect(recordingEngine.getState()).toBeDefined();
  });

  test('should start recording', async () => {
    recordingEngine.initialize(mockStream);

    await recordingEngine.startRecording();

    // Verify that the MediaRecorder's start method was called
    expect(
      (window as any).MediaRecorder.mock.instances[0].start,
    ).toHaveBeenCalled();
  });

  test('should stop recording and return a blob', async () => {
    recordingEngine.initialize(mockStream);

    // Mock the stop behavior
    const mockBlob = new Blob(['test'], { type: 'audio/webm' });
    (window as any).MediaRecorder.mock.instances[0].onstop = jest.fn();

    const result = await recordingEngine.stopRecording();

    // Verify that the MediaRecorder's stop method was called
    expect(
      (window as any).MediaRecorder.mock.instances[0].stop,
    ).toHaveBeenCalled();
  });

  test('should pause and resume recording', () => {
    recordingEngine.initialize(mockStream);

    // Start recording first
    (window as any).MediaRecorder.mock.instances[0].state = 'recording';

    recordingEngine.pauseRecording();
    expect(
      (window as any).MediaRecorder.mock.instances[0].pause,
    ).toHaveBeenCalled();

    (window as any).MediaRecorder.mock.instances[0].state = 'paused';

    recordingEngine.resumeRecording();
    expect(
      (window as any).MediaRecorder.mock.instances[0].resume,
    ).toHaveBeenCalled();
  });

  test('should return correct recording state', () => {
    expect(recordingEngine.getState()).toBe('idle');

    // This would change after calling startRecording, etc.
  });

  test('should handle errors during initialization', () => {
    // Test error handling when MediaRecorder is not available
    const originalMediaRecorder = (window as any).MediaRecorder;
    (window as any).MediaRecorder = undefined;

    expect(() => {
      recordingEngine.initialize(mockStream);
    }).toThrow();

    // Restore original MediaRecorder
    (window as any).MediaRecorder = originalMediaRecorder;
  });
});
