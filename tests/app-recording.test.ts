import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
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

describe('App Component Recording Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should start recording when Record button is clicked', async () => {
    const wrapper = mount(App, {
      attachTo: document.body
    });

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Initially, should be ready to record
    expect(wrapper.vm.status).toBe('Ready to record');
    expect(wrapper.vm.isRecording).toBe(false);

    // Find and click the record button
    const recordButton = wrapper.find('#recordBtn');
    expect(recordButton.exists()).toBe(true);

    await recordButton.trigger('click');

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that the status has changed and recording started
    expect(wrapper.vm.status).toContain('Recording');
    expect(wrapper.vm.isRecording).toBe(true);
  });

  it('should stop recording when Stop button is clicked', async () => {
    const wrapper = mount(App, {
      attachTo: document.body
    });

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // First start recording
    const recordButton = wrapper.find('#recordBtn');
    const stopButton = wrapper.find('#stopBtn');
    
    expect(recordButton.exists()).toBe(true);
    expect(stopButton.exists()).toBe(true);

    // Mock that recording has started
    wrapper.vm.isRecording = true;
    wrapper.vm.status = 'Recording... Press STOP to finish';

    await stopButton.trigger('click');

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that recording has stopped
    expect(wrapper.vm.isRecording).toBe(false);
    expect(wrapper.vm.status).toBe('Recording saved!');
  });

  it('should save recording to storage after stopping', async () => {
    const { fixedStorageModule } = await import('../src/modules/storage/FixedStorageModule');
    
    const wrapper = mount(App, {
      attachTo: document.body
    });

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock that recording has started
    wrapper.vm.isRecording = true;
    wrapper.vm.status = 'Recording... Press STOP to finish';

    // Find and click the stop button
    const stopButton = wrapper.find('#stopBtn');
    await stopButton.trigger('click');

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify that saveRecording was called
    expect(fixedStorageModule.saveRecording).toHaveBeenCalled();
  });

  it('should update recordings list after saving', async () => {
    const { fixedStorageModule } = await import('../src/modules/storage/FixedStorageModule');
    
    // Mock a recording being returned
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

    const wrapper = mount(App, {
      attachTo: document.body
    });

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock that recording has started
    wrapper.vm.isRecording = true;
    wrapper.vm.status = 'Recording... Press STOP to finish';

    // Find and click the stop button
    const stopButton = wrapper.find('#stopBtn');
    await stopButton.trigger('click');

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify that getAllRecordings was called to update the list
    expect(fixedStorageModule.getAllRecordings).toHaveBeenCalled();
    expect(wrapper.vm.recordings.length).toBe(1);
  });

  it('should handle recording errors gracefully', async () => {
    const { audioModule } = await import('../src/modules/AudioModule');
    
    // Mock an error during initialization
    (audioModule.initialize as vi.MockedFunction<any>).mockRejectedValue(
      new Error('Microphone access denied')
    );

    const wrapper = mount(App, {
      attachTo: document.body
    });

    // Wait for component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find and click the record button
    const recordButton = wrapper.find('#recordBtn');
    await recordButton.trigger('click');

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that error is handled gracefully
    expect(wrapper.vm.status).toContain('Error:');
  });

  it('should display recordings in the history panel', async () => {
    const { fixedStorageModule } = await import('../src/modules/storage/FixedStorageModule');
    
    // Mock recordings being returned
    (fixedStorageModule.getAllRecordings as vi.MockedFunction<any>).mockResolvedValue([
      {
        id: 'test-id-1',
        blob: new Blob(['test1'], { type: 'audio/webm' }),
        metadata: {
          title: 'First Recording',
          timestamp: Date.now() - 10000, // 10 seconds ago
          format: 'webm'
        }
      },
      {
        id: 'test-id-2',
        blob: new Blob(['test2'], { type: 'audio/webm' }),
        metadata: {
          title: 'Second Recording',
          timestamp: Date.now(), // now
          format: 'mp3'
        }
      }
    ]);

    const wrapper = mount(App, {
      attachTo: document.body
    });

    // Wait for component to be mounted and data to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that recordings are loaded
    expect(wrapper.vm.recordings.length).toBe(2);

    // Expand the history accordion to see the recordings
    const historyAccordion = wrapper.find('#history-accordion');
    await historyAccordion.trigger('click');

    // Wait for DOM update
    await new Promise(resolve => setTimeout(resolve, 50));

    // Check if recording items are rendered
    const recordingItems = wrapper.findAll('.recording-item');
    expect(recordingItems.length).toBe(2);

    // Check that the newest recording appears first
    const firstItemTitle = recordingItems[0].find('.recording-info strong').text();
    expect(firstItemTitle).toBe('Second Recording');
  });
});