import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApp } from 'vue';
import App from '../src/App.vue';

// Mock the modules that depend on browser APIs
vi.mock('../src/modules/AudioModule', () => ({
  audioModule: {
    initialize: vi.fn(() => Promise.resolve({})),
    startRecording: vi.fn(() => Promise.resolve()),
    stopRecording: vi.fn(() => Promise.resolve(new Blob(['test'], { type: 'audio/webm' }))),
    cleanup: vi.fn(() => Promise.resolve())
  }
}));

vi.mock('../src/modules/storage/FixedStorageModule', () => ({
  fixedStorageModule: {
    initialize: vi.fn(() => Promise.resolve()),
    saveRecording: vi.fn(() => Promise.resolve('test-id')),
    getAllRecordings: vi.fn(() => Promise.resolve([])),
    deleteRecording: vi.fn(() => Promise.resolve())
  }
}));

vi.mock('../src/modules/logging', () => ({
  loggingModule: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    exportLogs: vi.fn()
  }
}));

vi.mock('../src/modules/TranscriptionModule', () => ({
  transcriptionModule: {
    isAvailable: vi.fn(() => true),
    startTranscription: vi.fn(() => Promise.resolve()),
    stopTranscription: vi.fn(() => Promise.resolve()),
    abortTranscription: vi.fn(() => Promise.resolve()),
    detectLanguage: vi.fn(() => Promise.resolve('en')),
    setCallbacks: vi.fn()
  },
  LanguageCode: {
    ENGLISH: 'en',
    RUSSIAN: 'ru'
  }
}));

vi.mock('../src/modules/LoggerModule', () => ({
  appLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

describe('App Component Logic Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should have correct initial state', async () => {
    // Create the app instance
    const app = createApp(App);
    const vm = app.mount(document.createElement('div'));

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check initial state
    expect(vm.status).toBe('Ready to record');
    expect(vm.isRecording).toBe(false);
    expect(vm.currentRecording).toBeNull();
    expect(vm.transcription).toBe('');
    expect(vm.translation).toBe('');
    expect(vm.recordings.length).toBe(0);

    app.unmount();
  });

  it('should update state when starting recording', async () => {
    // Mock the audio module initialize method
    const { audioModule } = await import('../src/modules/AudioModule');
    (audioModule.initialize as vi.MockedFunction<any>).mockResolvedValue({});

    // Create the app instance
    const app = createApp(App);
    const vm = app.mount(document.createElement('div'));

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Call the startRecording method directly
    await vm.startRecording();

    // Check that the state has updated
    expect(vm.status).toContain('Recording');
    expect(vm.isRecording).toBe(true);

    app.unmount();
  });

  it('should update state when stopping recording', async () => {
    // Mock the audio module methods
    const { audioModule } = await import('../src/modules/AudioModule');
    (audioModule.initialize as vi.MockedFunction<any>).mockResolvedValue({});
    (audioModule.stopRecording as vi.MockedFunction<any>).mockResolvedValue(
      new Blob(['test'], { type: 'audio/webm' })
    );

    // Mock the storage module
    const { fixedStorageModule } = await import('../src/modules/storage/FixedStorageModule');
    (fixedStorageModule.saveRecording as vi.MockedFunction<any>).mockResolvedValue('test-id');
    (fixedStorageModule.getAllRecordings as vi.MockedFunction<any>).mockResolvedValue([]);

    // Create the app instance
    const app = createApp(App);
    const vm = app.mount(document.createElement('div'));

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Set the component to recording state
    vm.isRecording = true;
    vm.status = 'Recording... Press STOP to finish';

    // Call the stopRecording method directly
    await vm.stopRecording();

    // Check that the state has updated
    expect(vm.isRecording).toBe(false);
    expect(vm.status).toBe('Recording saved!');

    app.unmount();
  });

  it('should save recording to storage when stopping', async () => {
    // Mock the audio module methods
    const { audioModule } = await import('../src/modules/AudioModule');
    (audioModule.initialize as vi.MockedFunction<any>).mockResolvedValue({});
    (audioModule.stopRecording as vi.MockedFunction<any>).mockResolvedValue(
      new Blob(['test'], { type: 'audio/webm' })
    );

    // Mock the storage module
    const { fixedStorageModule } = await import('../src/modules/storage/FixedStorageModule');
    const saveRecordingSpy = vi.spyOn(fixedStorageModule, 'saveRecording');
    const getAllRecordingsSpy = vi.spyOn(fixedStorageModule, 'getAllRecordings');
    (fixedStorageModule.saveRecording as vi.MockedFunction<any>).mockResolvedValue('test-id');
    (fixedStorageModule.getAllRecordings as vi.MockedFunction<any>).mockResolvedValue([]);

    // Create the app instance
    const app = createApp(App);
    const vm = app.mount(document.createElement('div'));

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Set the component to recording state
    vm.isRecording = true;
    vm.status = 'Recording... Press STOP to finish';

    // Call the stopRecording method directly
    await vm.stopRecording();

    // Verify that saveRecording was called
    expect(saveRecordingSpy).toHaveBeenCalled();

    app.unmount();
  });

  it('should handle recording errors gracefully', async () => {
    // Mock an error during initialization
    const { audioModule } = await import('../src/modules/AudioModule');
    (audioModule.initialize as vi.MockedFunction<any>).mockRejectedValue(
      new Error('Microphone access denied')
    );

    // Create the app instance
    const app = createApp(App);
    const vm = app.mount(document.createElement('div'));

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Call the startRecording method which should fail
    await vm.startRecording();

    // Check that error is handled gracefully
    expect(vm.status).toContain('Error:');

    app.unmount();
  });

  it('should update recordings list after saving', async () => {
    // Mock the audio module methods
    const { audioModule } = await import('../src/modules/AudioModule');
    (audioModule.initialize as vi.MockedFunction<any>).mockResolvedValue({});
    (audioModule.stopRecording as vi.MockedFunction<any>).mockResolvedValue(
      new Blob(['test'], { type: 'audio/webm' })
    );

    // Mock the storage module with a recording
    const { fixedStorageModule } = await import('../src/modules/storage/FixedStorageModule');
    (fixedStorageModule.saveRecording as vi.MockedFunction<any>).mockResolvedValue('test-id');
    (fixedStorageModule.getAllRecordings as vi.MockedFunction<any>).mockResolvedValue([
      {
        id: 'test-id',
        blob: new Blob(['test'], { type: 'audio/webm' }),
        metadata: {
          title: 'Test Recording',
          timestamp: Date.now(),
          format: 'webm'
        }
      }
    ]);

    // Create the app instance
    const app = createApp(App);
    const vm = app.mount(document.createElement('div'));

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Set the component to recording state
    vm.isRecording = true;
    vm.status = 'Recording... Press STOP to finish';

    // Call the stopRecording method directly
    await vm.stopRecording();

    // Check that the recordings list was updated
    expect(vm.recordings.length).toBe(1);
    expect(vm.recordings[0].id).toBe('test-id');
    expect(vm.recordings[0].title).toBe('Test Recording');

    app.unmount();
  });
});