import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../src/App.vue';
import { audioModule } from '../src/modules/AudioModule';
import { fixedStorageModule } from '../src/modules/storage/FixedStorageModule';

// Mock the MediaRecorder API since it's not available in test environment
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  stream: null,
  mimeType: 'audio/webm',
  state: 'inactive',
  onstart: null,
  onstop: null,
  ondataavailable: null,
  onpause: null,
  onresume: null,
  requestData: vi.fn()
};

// Mock the getUserMedia API
const mockMediaStream = {
  getTracks: vi.fn(() => []),
  active: true,
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  clone: vi.fn(),
  getAudioTracks: vi.fn(() => []),
  getVideoTracks: vi.fn(() => [])
};

// Mock the AudioContext API
const mockAudioContext = {
  createMediaStreamSource: vi.fn(() => ({
    connect: vi.fn()
  })),
  createAnalyser: vi.fn(() => ({
    connect: vi.fn()
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn()
  })),
  close: vi.fn(),
  state: 'running',
  suspend: vi.fn(),
  resume: vi.fn()
};

describe('Audio Recording and Storage Tests', () => {
  let wrapper;
  
  beforeEach(async () => {
    // Mock browser APIs
    global.MediaRecorder = vi.fn(() => mockMediaRecorder);
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn(() => Promise.resolve(mockMediaStream))
    };
    
    // Mock AudioContext
    global.AudioContext = vi.fn(() => mockAudioContext);
    global.webkitAudioContext = global.AudioContext;
    
    // Mount the component
    wrapper = mount(App, {
      attachTo: document.body
    });
    
    // Wait for component to be mounted
    await wrapper.vm.$nextTick();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('should initialize audio module properly', async () => {
    // Simulate clicking the record button to trigger audio initialization
    const recordButton = wrapper.find('#recordBtn');
    expect(recordButton.exists()).toBe(true);
    
    // Check initial state
    expect(wrapper.vm.status).toBe('Ready to record');
    expect(wrapper.vm.isRecording).toBe(false);
  });

  it('should start recording when Record button is clicked', async () => {
    const recordButton = wrapper.find('#recordBtn');
    expect(recordButton.exists()).toBe(true);
    
    // Mock the audio module initialize method
    const originalInitialize = audioModule.initialize;
    audioModule.initialize = vi.fn(() => Promise.resolve(mockMediaStream));
    
    // Mock the audio module startRecording method
    const originalStartRecording = audioModule.startRecording;
    audioModule.startRecording = vi.fn(() => Promise.resolve());
    
    // Click the record button
    await recordButton.trigger('click');
    
    // Wait for async operations
    await wrapper.vm.$nextTick();
    
    // Check that the status has changed
    expect(wrapper.vm.status).toContain('Recording');
    expect(wrapper.vm.isRecording).toBe(true);
    
    // Restore original methods
    audioModule.initialize = originalInitialize;
    audioModule.startRecording = originalStartRecording;
  });

  it('should stop recording when Stop button is clicked', async () => {
    const recordButton = wrapper.find('#recordBtn');
    const stopButton = wrapper.find('#stopBtn');
    
    expect(stopButton.exists()).toBe(true);
    
    // First start recording
    const originalInitialize = audioModule.initialize;
    audioModule.initialize = vi.fn(() => Promise.resolve(mockMediaStream));
    
    const originalStartRecording = audioModule.startRecording;
    audioModule.startRecording = vi.fn(() => Promise.resolve());
    
    await recordButton.trigger('click');
    await wrapper.vm.$nextTick();
    
    // Mock the stopRecording method to return a blob
    const originalStopRecording = audioModule.stopRecording;
    const mockBlob = new Blob(['fake-audio-data'], { type: 'audio/webm' });
    audioModule.stopRecording = vi.fn(() => Promise.resolve(mockBlob));
    
    // Mock the storage module
    const originalSaveRecording = fixedStorageModule.saveRecording;
    fixedStorageModule.saveRecording = vi.fn(() => Promise.resolve('test-id'));
    
    const originalGetAllRecordings = fixedStorageModule.getAllRecordings;
    fixedStorageModule.getAllRecordings = vi.fn(() => Promise.resolve([
      {
        id: 'test-id',
        blob: mockBlob,
        metadata: {
          title: 'Test Recording',
          timestamp: Date.now(),
          format: 'webm'
        }
      }
    ]));
    
    // Click the stop button
    await stopButton.trigger('click');
    
    // Wait for async operations
    await wrapper.vm.$nextTick();
    
    // Check that recording has stopped
    expect(wrapper.vm.isRecording).toBe(false);
    expect(wrapper.vm.status).toBe('Recording saved!');
    
    // Check that the recording was saved
    expect(fixedStorageModule.saveRecording).toHaveBeenCalled();
    expect(fixedStorageModule.getAllRecordings).toHaveBeenCalled();
    
    // Restore original methods
    audioModule.initialize = originalInitialize;
    audioModule.startRecording = originalStartRecording;
    audioModule.stopRecording = originalStopRecording;
    fixedStorageModule.saveRecording = originalSaveRecording;
    fixedStorageModule.getAllRecordings = originalGetAllRecordings;
  });

  it('should display recordings in history after saving', async () => {
    const recordButton = wrapper.find('#recordBtn');
    const stopButton = wrapper.find('#stopBtn');
    
    // Mock audio methods
    const originalInitialize = audioModule.initialize;
    audioModule.initialize = vi.fn(() => Promise.resolve(mockMediaStream));
    
    const originalStartRecording = audioModule.startRecording;
    audioModule.startRecording = vi.fn(() => Promise.resolve());
    
    const originalStopRecording = audioModule.stopRecording;
    const mockBlob = new Blob(['fake-audio-data'], { type: 'audio/webm' });
    audioModule.stopRecording = vi.fn(() => Promise.resolve(mockBlob));
    
    // Mock storage methods
    const originalSaveRecording = fixedStorageModule.saveRecording;
    fixedStorageModule.saveRecording = vi.fn(() => Promise.resolve('test-id-2'));
    
    const originalGetAllRecordings = fixedStorageModule.getAllRecordings;
    fixedStorageModule.getAllRecordings = vi.fn(() => Promise.resolve([
      {
        id: 'test-id-2',
        blob: mockBlob,
        metadata: {
          title: 'Test Recording 2',
          timestamp: Date.now(),
          format: 'webm'
        }
      }
    ]));
    
    // Start and stop recording
    await recordButton.trigger('click');
    await wrapper.vm.$nextTick();
    
    await stopButton.trigger('click');
    await wrapper.vm.$nextTick();
    
    // Check that recordings are displayed in the UI
    const historyAccordion = wrapper.find('#history-accordion');
    await historyAccordion.trigger('click'); // Expand the history panel
    
    await wrapper.vm.$nextTick();
    
    // Check if recordings list exists and has items
    const recordingsList = wrapper.find('#recordingsList');
    expect(recordingsList.exists()).toBe(true);
    
    // Since Vue updates DOM asynchronously, we need to wait a bit more
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Update the wrapper to get the latest DOM state
    await wrapper.vm.$nextTick();
    
    // Check if recording items are present
    const recordingItems = wrapper.findAll('.recording-item');
    expect(recordingItems.length).toBeGreaterThan(0);
    
    // Restore original methods
    audioModule.initialize = originalInitialize;
    audioModule.startRecording = originalStartRecording;
    audioModule.stopRecording = originalStopRecording;
    fixedStorageModule.saveRecording = originalSaveRecording;
    fixedStorageModule.getAllRecordings = originalGetAllRecordings;
  });

  it('should handle recording errors gracefully', async () => {
    const recordButton = wrapper.find('#recordBtn');
    
    // Mock audio module to throw an error
    const originalInitialize = audioModule.initialize;
    audioModule.initialize = vi.fn(() => Promise.reject(new Error('Microphone access denied')));
    
    // Click the record button
    await recordButton.trigger('click');
    
    // Wait for async operations
    await wrapper.vm.$nextTick();
    
    // Check that error is handled gracefully
    expect(wrapper.vm.status).toContain('Error:');
    
    // Restore original method
    audioModule.initialize = originalInitialize;
  });
});