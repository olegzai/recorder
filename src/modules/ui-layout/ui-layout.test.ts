/**
 * Tests for UILayoutModule
 * Note: These tests would need to be adapted for actual execution since they involve DOM manipulation
 */

import { UILayoutModule } from './ui-layout';

describe('UILayoutModule', () => {
  let uiLayout: UILayoutModule;
  let container: HTMLDivElement;

  beforeEach(() => {
    uiLayout = new UILayoutModule();

    // Create a container element for testing
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    jest.clearAllMocks();

    // Clean up the container
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  test('should initialize UI layout correctly', () => {
    uiLayout.initialize('test-container');

    // Check if the main container exists
    expect(document.getElementById('test-container')).toBeTruthy();

    // Check if the main accordions exist
    expect(document.getElementById('recorder-accordion')).toBeTruthy();
    expect(document.getElementById('history-accordion')).toBeTruthy();
    expect(document.getElementById('settings-accordion')).toBeTruthy();
  });

  test('should update recorder status', () => {
    uiLayout.initialize('test-container');

    uiLayout.updateRecorderStatus('Recording...');

    const statusElement = document.getElementById('recorderStatus');
    expect(statusElement?.textContent).toBe('Recording...');
  });

  test('should add recording to history', () => {
    uiLayout.initialize('test-container');

    const testId = 'test-recording-1';
    const testTitle = 'Test Recording';
    const testDate = '2023-01-01 12:00:00';
    const testDuration = '1:23';
    const testFormat = 'webm';
    const testBlobUrl = 'blob:test-url';

    uiLayout.addRecordingToHistory(
      testId,
      testTitle,
      testDate,
      testDuration,
      testFormat,
      testBlobUrl,
    );

    const recordingsList = document.getElementById('recordingsList');
    expect(recordingsList?.children.length).toBe(1);

    const firstItem = recordingsList?.firstElementChild;
    expect(firstItem?.innerHTML).toContain(testTitle);
    expect(firstItem?.innerHTML).toContain(testDate);
  });

  test('should update settings form', () => {
    uiLayout.initialize('test-container');

    const newValues = {
      sampleRate: 22050,
      bitrate: 64000,
      audioFormat: 'mp3',
      transcriptionLang: 'ru',
      translationLang: 'de',
      retentionPeriod: '30',
    };

    uiLayout.updateSettingsForm(newValues);

    expect(
      (document.getElementById('sampleRate') as HTMLInputElement).value,
    ).toBe('22050');
    expect((document.getElementById('bitrate') as HTMLInputElement).value).toBe(
      '64000',
    );
    expect(
      (document.getElementById('audioFormat') as HTMLSelectElement).value,
    ).toBe('mp3');
  });

  test('should get settings values', () => {
    uiLayout.initialize('test-container');

    // Set some values
    (document.getElementById('sampleRate') as HTMLInputElement).value = '22050';
    (document.getElementById('bitrate') as HTMLInputElement).value = '64000';
    (document.getElementById('audioFormat') as HTMLSelectElement).value = 'mp3';

    const values = uiLayout.getSettingsValues();

    expect(values.sampleRate).toBe(22050);
    expect(values.bitrate).toBe(64000);
    expect(values.audioFormat).toBe('mp3');
  });

  test('should add log entry', () => {
    uiLayout.initialize('test-container');

    const testMessage = 'Test log message';
    uiLayout.addLogEntry(testMessage, 'info');

    const logOutput = document.getElementById('logOutput');
    expect(logOutput?.textContent).toContain(testMessage);
  });
});
