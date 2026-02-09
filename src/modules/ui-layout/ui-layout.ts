/**
 * UILayoutModule manages the UI components and accordion interface
 */
export class UILayoutModule {
  private container: HTMLElement | null = null;
  private elements: {
    recordBtn?: HTMLButtonElement;
    stopBtn?: HTMLButtonElement;
    transcribeBtn?: HTMLButtonElement;
    translateBtn?: HTMLButtonElement;
    voiceoverBtn?: HTMLButtonElement;
    recorderStatus?: HTMLElement;
    recordingsList?: HTMLUListElement;
    sampleRateInput?: HTMLInputElement;
    bitrateInput?: HTMLInputElement;
    audioFormatSelect?: HTMLSelectElement;
    transcriptionLangSelect?: HTMLSelectElement;
    translationLangSelect?: HTMLSelectElement;
    retentionPeriodSelect?: HTMLSelectElement;
    logOutput?: HTMLPreElement;
    exportLogsBtn?: HTMLButtonElement;
  } = {};

  /**
   * Initialize the UI layout
   */
  initialize(containerId: string = 'app'): void {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      throw new Error(`Container element with id '${containerId}' not found`);
    }

    // Render the UI
    this.render();

    // Cache references to important elements
    this.cacheElements();
  }

  /**
   * Render the entire UI
   */
  private render(): void {
    if (!this.container) {
      return;
    }

    this.container.innerHTML = `
      <div id="app">
        <!-- Accordions Interface -->
        <details id="recorder-accordion" open>
          <summary>Recorder</summary>
          <div class="recorder-controls">
            <button id="recordBtn">Record</button>
            <button id="stopBtn">Stop</button>
            <div id="recorderStatus">Ready to record</div>
            <div id="voiceTranscriptionControls">
              <button id="transcribeBtn">Transcribe</button>
              <button id="translateBtn">Translate</button>
              <button id="voiceoverBtn">Voiceover</button>
            </div>
          </div>
        </details>

        <details id="history-accordion">
          <summary>History</summary>
          <div class="history-panel">
            <ul id="recordingsList">
              <!-- Recordings will appear here in order from newest to oldest -->
            </ul>
          </div>
        </details>

        <details id="settings-accordion">
          <summary>Settings</summary>
          <div class="settings-panel">
            <div>
              <label>Sample Rate: <input type="number" id="sampleRate" value="44100"></label>
            </div>
            <div>
              <label>Bitrate: <input type="number" id="bitrate" value="128000"></label>
            </div>
            <div>
              <label>Format: 
                <select id="audioFormat">
                  <option value="wav">WAV</option>
                  <option value="mp3">MP3</option>
                  <option value="ogg">OGG</option>
                  <option value="webm">WebM</option>
                </select>
              </label>
            </div>
            <div>
              <label>Transcription Language: 
                <select id="transcriptionLang">
                  <option value="ru">Russian</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
            <div>
              <label>Translation Language: 
                <select id="translationLang">
                  <option value="en">English</option>
                  <option value="ru">Russian</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </label>
            </div>
            <div>
              <label>Retention Period: 
                <select id="retentionPeriod">
                  <option value="never">Never delete</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="clear">Full cleanup</option>
                </select>
              </label>
            </div>
          </div>
        </details>

        <details id="plugins-accordion">
          <summary>Plugins</summary>
          <div class="plugins-panel">
            <label><input type="checkbox" id="recorderEnabled" checked> Recording Module</label>
            <label><input type="checkbox" id="transcriptionEnabled" checked> Transcription Module</label>
            <label><input type="checkbox" id="translationEnabled"> Translation Module</label>
            <label><input type="checkbox" id="voiceoverEnabled"> Voiceover Module</label>
            <label><input type="checkbox" id="historyEnabled" checked> History</label>
            <label><input type="checkbox" id="settingsEnabled" checked> Settings</label>
          </div>
        </details>

        <details id="help-accordion">
          <summary>Help</summary>
          <div class="help-panel">
            <h3>Documentation</h3>
            <p>To get help on using the application, see the Frequently Asked Questions (FAQ) section below.</p>
            <h3>Support</h3>
            <p>If you have problems, open an issue in the project repository.</p>
          </div>
        </details>

        <details id="log-accordion">
          <summary>Log</summary>
          <div class="log-panel">
            <pre id="logOutput"></pre>
            <button id="exportLogsBtn">Export logs</button>
          </div>
        </details>
      </div>
    `;
  }

  /**
   * Cache references to important UI elements
   */
  private cacheElements(): void {
    this.elements.recordBtn = document.getElementById(
      'recordBtn',
    ) as HTMLButtonElement;
    this.elements.stopBtn = document.getElementById(
      'stopBtn',
    ) as HTMLButtonElement;
    this.elements.transcribeBtn = document.getElementById(
      'transcribeBtn',
    ) as HTMLButtonElement;
    this.elements.translateBtn = document.getElementById(
      'translateBtn',
    ) as HTMLButtonElement;
    this.elements.voiceoverBtn = document.getElementById(
      'voiceoverBtn',
    ) as HTMLButtonElement;
    this.elements.recorderStatus = document.getElementById(
      'recorderStatus',
    ) as HTMLElement;
    this.elements.recordingsList = document.getElementById(
      'recordingsList',
    ) as HTMLUListElement;
    this.elements.sampleRateInput = document.getElementById(
      'sampleRate',
    ) as HTMLInputElement;
    this.elements.bitrateInput = document.getElementById(
      'bitrate',
    ) as HTMLInputElement;
    this.elements.audioFormatSelect = document.getElementById(
      'audioFormat',
    ) as HTMLSelectElement;
    this.elements.transcriptionLangSelect = document.getElementById(
      'transcriptionLang',
    ) as HTMLSelectElement;
    this.elements.translationLangSelect = document.getElementById(
      'translationLang',
    ) as HTMLSelectElement;
    this.elements.retentionPeriodSelect = document.getElementById(
      'retentionPeriod',
    ) as HTMLSelectElement;
    this.elements.logOutput = document.getElementById(
      'logOutput',
    ) as HTMLPreElement;
    this.elements.exportLogsBtn = document.getElementById(
      'exportLogsBtn',
    ) as HTMLButtonElement;
  }

  /**
   * Update the recorder status display
   */
  updateRecorderStatus(status: string): void {
    if (this.elements.recorderStatus) {
      this.elements.recorderStatus.textContent = status;
    }
  }

  /**
   * Add a recording to the history list
   */
  addRecordingToHistory(
    id: string,
    title: string,
    date: string,
    duration: string,
    format: string,
    blobUrl: string,
  ): void {
    if (!this.elements.recordingsList) {
      return;
    }

    const listItem = document.createElement('li');
    listItem.className = 'recording-item';
    listItem.innerHTML = `
      <div class="recording-info">
        <strong>${title}</strong>
        <span class="recording-meta">${date} • ${duration} • ${format}</span>
      </div>
      <div class="recording-actions">
        <audio controls src="${blobUrl}"></audio>
        <button class="delete-recording-btn" data-id="${id}">Delete</button>
      </div>
    `;

    // Add to the beginning of the list (newest first)
    this.elements.recordingsList.insertBefore(
      listItem,
      this.elements.recordingsList.firstChild,
    );
  }

  /**
   * Remove a recording from the history list
   */
  removeRecordingFromHistory(id: string): void {
    if (!this.elements.recordingsList) {
      return;
    }

    const recordingElement = this.elements.recordingsList.querySelector(
      `[data-id="${id}"]`,
    );
    if (recordingElement) {
      recordingElement.parentElement?.remove(); // Remove the li element
    }
  }

  /**
   * Clear all recordings from the history list
   */
  clearHistoryList(): void {
    if (this.elements.recordingsList) {
      this.elements.recordingsList.innerHTML = '';
    }
  }

  /**
   * Update settings form with provided values
   */
  updateSettingsForm(values: {
    sampleRate?: number;
    bitrate?: number;
    audioFormat?: string;
    transcriptionLang?: string;
    translationLang?: string;
    retentionPeriod?: string;
  }): void {
    if (this.elements.sampleRateInput && values.sampleRate !== undefined) {
      this.elements.sampleRateInput.value = values.sampleRate.toString();
    }

    if (this.elements.bitrateInput && values.bitrate !== undefined) {
      this.elements.bitrateInput.value = values.bitrate.toString();
    }

    if (this.elements.audioFormatSelect && values.audioFormat !== undefined) {
      this.elements.audioFormatSelect.value = values.audioFormat;
    }

    if (
      this.elements.transcriptionLangSelect &&
      values.transcriptionLang !== undefined
    ) {
      this.elements.transcriptionLangSelect.value = values.transcriptionLang;
    }

    if (
      this.elements.translationLangSelect &&
      values.translationLang !== undefined
    ) {
      this.elements.translationLangSelect.value = values.translationLang;
    }

    if (
      this.elements.retentionPeriodSelect &&
      values.retentionPeriod !== undefined
    ) {
      this.elements.retentionPeriodSelect.value = values.retentionPeriod;
    }
  }

  /**
   * Get current settings from the form
   */
  getSettingsValues(): {
    sampleRate: number;
    bitrate: number;
    audioFormat: string;
    transcriptionLang: string;
    translationLang: string;
    retentionPeriod: string;
  } {
    return {
      sampleRate: parseInt(this.elements.sampleRateInput?.value || '44100', 10),
      bitrate: parseInt(this.elements.bitrateInput?.value || '128000', 10),
      audioFormat: this.elements.audioFormatSelect?.value || 'webm',
      transcriptionLang: this.elements.transcriptionLangSelect?.value || 'en',
      translationLang: this.elements.translationLangSelect?.value || 'en',
      retentionPeriod: this.elements.retentionPeriodSelect?.value || 'never',
    };
  }

  /**
   * Add a log entry
   */
  addLogEntry(
    message: string,
    level: 'info' | 'warn' | 'error' = 'info',
  ): void {
    if (!this.elements.logOutput) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    this.elements.logOutput.textContent += logLine;

    // Auto-scroll to bottom
    this.elements.logOutput.scrollTop = this.elements.logOutput.scrollHeight;
  }

  /**
   * Clear the log output
   */
  clearLog(): void {
    if (this.elements.logOutput) {
      this.elements.logOutput.textContent = '';
    }
  }

  /**
   * Get the log content as a string
   */
  getLogContent(): string {
    return this.elements.logOutput?.textContent || '';
  }

  /**
   * Set up event listeners for UI elements
   */
  setupEventListeners(): void {
    // Add event listeners for recording controls
    if (this.elements.recordBtn) {
      this.elements.recordBtn.onclick = () => {
        // This will be handled by the main application
      };
    }

    if (this.elements.stopBtn) {
      this.elements.stopBtn.onclick = () => {
        // This will be handled by the main application
      };
    }

    if (this.elements.transcribeBtn) {
      this.elements.transcribeBtn.onclick = () => {
        // This will be handled by the main application
      };
    }

    if (this.elements.translateBtn) {
      this.elements.translateBtn.onclick = () => {
        // This will be handled by the main application
      };
    }

    if (this.elements.voiceoverBtn) {
      this.elements.voiceoverBtn.onclick = () => {
        // This will be handled by the main application
      };
    }

    if (this.elements.exportLogsBtn) {
      this.elements.exportLogsBtn.onclick = () => {
        // This will be handled by the main application
      };
    }
  }

  /**
   * Show/hide accordions based on plugin settings
   */
  setAccordionVisibility(plugins: {
    recorderEnabled: boolean;
    transcriptionEnabled: boolean;
    translationEnabled: boolean;
    voiceoverEnabled: boolean;
    historyEnabled: boolean;
    settingsEnabled: boolean;
  }): void {
    const accordions = {
      'recorder-accordion': this.container?.querySelector(
        '#recorder-accordion',
      ),
      'history-accordion': this.container?.querySelector('#history-accordion'),
      'settings-accordion': this.container?.querySelector(
        '#settings-accordion',
      ),
      'plugins-accordion': this.container?.querySelector('#plugins-accordion'),
      'help-accordion': this.container?.querySelector('#help-accordion'),
      'log-accordion': this.container?.querySelector('#log-accordion'),
    };

    if (accordions['recorder-accordion']) {
      (accordions['recorder-accordion'] as HTMLElement).style.display =
        plugins.recorderEnabled ? 'block' : 'none';
    }

    if (accordions['history-accordion']) {
      (accordions['history-accordion'] as HTMLElement).style.display =
        plugins.historyEnabled ? 'block' : 'none';
    }

    if (accordions['settings-accordion']) {
      (accordions['settings-accordion'] as HTMLElement).style.display =
        plugins.settingsEnabled ? 'block' : 'none';
    }
  }
}

// Default instance
export const uiLayoutModule = new UILayoutModule();
