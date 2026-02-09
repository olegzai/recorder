# Recorder

CSS-free, pure HTML+TypeScript+JavaScript browser-based audio recorder without a server, which works entirely in the browser without any backend dependencies. Includes speech transcription and translation features.

## Overview

Recorder is a lightweight, standalone sound recording solution that uses modern browser APIs to capture, process, and store audio directly in the user's browser. No backend infrastructure is required - everything happens on the client side for maximum privacy and portability. The application also provides speech-to-text transcription capabilities (in Russian and English) and translation into various languages with subsequent voiceover.

## Features

- **Serverless architecture**: Works entirely in the browser without backend dependencies
- **Privacy-focused**: Audio recordings never leave the user's device
- **No CSS**: Completely devoid of CSS and any styling, only clean HTML structure
- **Modern Web APIs**: Uses MediaRecorder API and Web Audio API for high-quality recording
- **Cross-platform compatibility**: Works in all modern browsers supporting Web Audio (desktop and mobile)
- **Lightweight**: Minimal code footprint without external dependencies
- **Export options**: Save recordings in multiple formats (WAV, MP3, etc.)
- **Transcription**: Ability to convert speech to text in Russian and English
- **Translation**: Function to translate transcribed text into different languages
- **Voiceover**: Ability to voice over translated text
- **Silence detection**: Automatic silence detection during recording
- **Automatic cleanup**: Configure retention period for recordings and ability to fully clear
- **Future CSS support**: In settings, ability to enable/disable CSS styling
- **Modular architecture**: Fully modular project, code and files developed as independent modules
- **Single build**: Compilation creates one final HTML file including all code
- **Plugin system**: All modules (recording, transcription, translation, history, settings, etc.) can be enabled/disabled as plugins

## Tech Stack

- **HTML5**: Semantic markup for recording interface
- **TypeScript**: Type-safe application logic and error handling
- **JavaScript**: Real-time execution and DOM manipulation
- **Web Audio API**: Audio processing and manipulation
- **MediaRecorder API**: Audio capture and encoding
- **Blob API**: File creation and download functionality
- **Web Speech API**: For speech-to-text transcription
- **Translation API integrations**: For text translation and voiceover
- **Module system**: For organizing code into independent components

## Architecture

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Microphone    │───▶│  Web Audio API   │───▶│ MediaRecorder   │
│   (Input)       │    │  (Processing)    │    │  (Encoding)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                            ┌─────────────────┐
                                            │   Blob Storage  │
                                            │  (On client)    │
                                            └─────────────────┘
                                                        │
                                                        ▼
                                            ┌─────────────────┐
                                            │ Download/Export │
                                            └─────────────────┘
                                                        │
                                                        ▼
                                            ┌─────────────────┐
                                            │Transcription    │
                                            │(Web Speech API) │
                                            └─────────────────┘
                                                        │
                                                        ▼
                                            ┌─────────────────┐
                                            │Translation/     │
                                            │Voiceover(API)   │
                                            └─────────────────┘
```

### Project Structure

```
recorder/
├── src/
│   ├── modules/
│   │   ├── audio-input/
│   │   ├── recording-engine/
│   │   ├── audio-processing/
│   │   ├── encoding/
│   │   ├── file-manager/
│   │   ├── transcription/
│   │   ├── translation/
│   │   ├── voiceover/
│   │   ├── storage/
│   │   ├── ui-layout/
│   │   ├── settings/
│   │   ├── logging/
│   │   └── plugin-manager/
│   ├── interfaces/
│   ├── utils/
│   └── types/
├── dist/
├── tests/
├── docs/
├── config/
├── package.json
├── tsconfig.json
└── README.md
```

Main directories:
- `src/modules/` - contains all application modules organized by functionality
- `dist/` - build output
- `tests/` - unit and integration tests
- `docs/` - additional documentation
- `config/` - configuration files for build and development

### Modular Architecture

The project is built using a modular architecture where each component is presented as an independent module:

- **AudioInputModule**: Audio input processing and microphone management
- **RecordingEngineModule**: Recording lifecycle control
- **AudioProcessingModule**: Audio processing and filter application
- **EncodingModule**: Encoding audio into various formats
- **FileManagerModule**: File management and recording export
- **TranscriptionModule**: Speech-to-text transcription
- **TranslationModule**: Text translation into different languages
- **VoiceoverModule**: Text voicing with different voices
- **StorageModule**: Data storage in localStorage and IndexedDB
- **UILayoutModule**: Interface management and accordions
- **SettingsModule**: Application settings management
- **LoggingModule**: Logging of all processes and actions
- **PluginManagerModule**: Plugin management and activation

During compilation, all modules are combined into a single final HTML file including all necessary code.

### Key Components

1. **Audio Input Handler**: Manages microphone access and permissions
2. **Recording Engine**: Controls recording lifecycle (start/stop)
3. **Audio Processor**: Applies silence detection and other filters
4. **Encoder**: Converts raw audio to desired output format
5. **File Manager**: Handles saving and exporting recordings
6. **Transcriber**: Converts speech to text (Russian and English)
7. **Translator**: Translates text into various languages
8. **Voiceover**: Voices over translated text with different voices
9. **Plugin Manager**: Manages enabling/disabling modules

## Interface

The project interface is implemented using accordions with HTML `<details>` and `<summary>` elements, allowing efficient content organization and improved user experience through expandable and collapsible sections.

Main interface accordions:

### 1. Recorder

```html
<details>
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
```

### 2. History

```html
<details>
  <summary>History</summary>
  <div class="history-panel">
    <ul id="recordingsList">
      <!-- Recordings will appear here in order from newest to oldest -->
      <!-- Each recording will include audio, transcription, translation, and metadata -->
    </ul>
  </div>
</details>
```

Recordings are stored in localStorage and IndexedDB to ensure maximum possible long-term storage between sessions. History is sorted from newest to oldest recordings.

### 3. Settings

```html
<details>
  <summary>Settings</summary>
  <div class="settings-panel">
    <label>Sample Rate: <input type="number" id="sampleRate" value="44100"></label>
    <label>Bitrate: <input type="number" id="bitrate" value="128000"></label>
    <label>Format: <select id="audioFormat"><option value="wav">WAV</option><option value="mp3">MP3</option><option value="ogg">OGG</option></select></label>
    <label>Transcription Language: <select id="transcriptionLang"><option value="ru">Russian</option><option value="en">English</option></select></label>
    <label>Translation Language: <select id="translationLang"><option value="en">English</option><option value="ru">Russian</option><option value="de">German</option><option value="fr">French</option><option value="es">Spanish</option></select></label>
    <label>Retention Period: <select id="retentionPeriod"><option value="never">Never delete</option><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="clear">Full cleanup</option></select></label>
  </div>
</details>
```

### 4. Plugins

```html
<details>
  <summary>Plugins</summary>
  <div class="plugins-panel">
    <label><input type="checkbox" id="recorderEnabled" checked> Recording Module</label>
    <label><input type="checkbox" id="transcriptionEnabled" checked> Transcription Module</label>
    <label><input type="checkbox" id="translationEnabled" checked> Translation Module</label>
    <label><input type="checkbox" id="voiceoverEnabled" checked> Voiceover Module</label>
    <label><input type="checkbox" id="historyEnabled" checked> History</label>
    <label><input type="checkbox" id="settingsEnabled" checked> Settings</label>
  </div>
</details>
```

### 5. Help

```html
<details>
  <summary>Help</summary>
  <div class="help-panel">
    <h3>Documentation</h3>
    <p>To get help on using the application, see the Frequently Asked Questions (FAQ) section below.</p>
    <h3>Support</h3>
    <p>If you have problems, open an issue in the project repository.</p>
  </div>
</details>
```

### 6. Log

```html
<details>
  <summary>Log</summary>
  <div class="log-panel">
    <pre id="logOutput"></pre>
    <button id="exportLogsBtn">Export logs</button>
  </div>
</details>
```

Complete logging of all processes, from function calls to user actions, for diagnostics and debugging. Logs include application performance information and can be exported on demand.

This approach ensures:

- Clean and organized interface structure
- Ability to hide and show content as needed
- Compatibility with modern browsers (desktop and mobile)
- Independence from CSS frameworks
- Ease of maintenance and modification
- Ability to play recordings directly in the interface
- Support for metadata for each recording (title, date, duration, language, etc.)
- Flexibility in configuring functionality through the plugin system

## Getting Started

### Prerequisites

- Modern browser supporting Web Audio API, MediaRecorder API, and Web Speech API
- Permissions for microphone access
- Internet connection (for transcription, translation, and voiceover)

### Installation

Since this is a serverless solution, no installation is required. Simply open the HTML file in a compatible browser:

```bash
# Clone repository
git clone <repository-link>
cd recorder

# Open in browser
open index.html
```

Or run via local HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then go to http://localhost:8000
```

### Development

For development and testing in real-time:

```bash
# Install dependencies
npm install

# Run in development mode with live reload
npm run dev

# Run tests
npm run test

# Check code for style errors
npm run lint
```

### Building the Project

The project uses a modular architecture where each component is developed as an independent module. To create the final HTML file including all code, execute:

```bash
# Build project to single HTML file
npm run build
# or
yarn build
```

This will create a single HTML file containing all necessary code, styles, and resources.

### Usage

1. Open the application in your browser
2. Grant microphone access when prompted
3. Click the record button to start voice recording
4. Click the stop button to finish recording
5. Use transcription, translation, and voiceover buttons for additional processing
6. View and play your recordings in the "History" accordion
7. Configure parameters in the "Settings" accordion as desired
8. Manage application functionality through the "Plugins" accordion

## API Reference

### Recording Functions

- `startRecording()` - Initiates audio recording
- `stopRecording()` - Stops current recording and processes audio
- `exportRecording(format)` - Exports recording in specified format

### Transcription and Translation Functions

- `transcribeAudio(audioBlob, language)` - Transcribes audio to text in specified language
- `translateText(text, targetLanguage)` - Translates text to specified language
- `voiceoverText(text, language)` - Voices over text with specified language/voice

### Plugin Management Functions

- `enablePlugin(pluginName)` - Enables specified plugin
- `disablePlugin(pluginName)` - Disables specified plugin
- `isPluginEnabled(pluginName)` - Checks if plugin is enabled

### Configuration Parameters

- `audioBitsPerSecond` - Sets audio bitrate
- `sampleRate` - Specifies sample rate for recording
- `channelCount` - Number of audio channels (mono/stereo)
- `mimeType` - Desired output format (audio/wav, audio/webm, etc.)
- `transcriptionLanguage` - Language for transcription (default Russian/English)
- `translationLanguage` - Target language for translation
- `retentionPeriod` - Retention period for recordings before automatic cleanup

## Browser Support

- Chrome 49+ (full support)
- Firefox 43+ (partial Web Speech API support)
- Safari 14+ (with limitations)
- Edge 79+ (full support)
- Mobile browser compatibility

## Security and Privacy

- All audio processing occurs on the client side
- Data is not sent to external servers (except for transcription/translation API requests)
- Explicit user permission required for microphone access
- Recording stops when user leaves the page
- Silence detection support for recording optimization
- Local storage of confidential recordings

## Limitations

- Recording duration is potentially unlimited (limited only by browser memory)
- Safari has limited MediaRecorder API and Web Speech API support
- Mobile browsers may have additional limitations
- Transcription and translation functions require internet connection

## Configuration

The application can be configured through the settings interface:

- **Sample Rate**: from 8000 Hz to 96000 Hz (default 44100 Hz)
- **Bitrate**: from 64 kbps to 320 kbps (default 128 kbps)
- **Audio Format**: WAV, MP3, OGG and other supported formats
- **Languages**: Russian and English support for transcription, more than 20 languages for translation
- **Retention Period**: configure automatic cleanup of recordings by date

## Performance

The application is optimized for browser operation:

- Uses minimal system resources
- Audio processing occurs in real-time
- Efficient memory management for long recordings
- Optimization for devices with limited resources

## Troubleshooting

If you have problems with the application:

1. **Microphone access problems**:
   - Check browser permissions for microphone access
   - Ensure microphone is not used by other applications
   - Reload page and grant permission again

2. **Transcription/translation problems**:
   - Check internet connection
   - Ensure Web Speech API is supported by your browser
   - Try using a different language for transcription

3. **Performance problems**:
   - Close other browser tabs to free memory
   - Check available space on device
   - Update browser to the latest version

## Development Roadmap

Detailed versioning plan and development stages are described in the [VERSIONS.md](VERSIONS.md) file.

Development will proceed using modular architecture where each functional block is implemented as an independent module, which is then integrated into the final build.

- [ ] Basic audio recording function
- [ ] Playback of recordings in interface
- [ ] Adding metadata to recordings
- [ ] Speech transcription (Russian and English)
- [ ] Translation to different languages
- [ ] Voiceover of translated text
- [ ] Silence detection
- [ ] Automatic cleanup by settings
- [ ] Export logs
- [ ] PWA (Progressive Web App) support
- [ ] Modular architecture with plugins
- [ ] Advanced audio editing capabilities
- [ ] Cloud storage integration (optional)

## Testing

The project includes comprehensive tests for quality assurance:

- **Unit tests**: Test individual components and functions
- **Integration tests**: Test interaction between modules
- **UI tests**: Test correct operation of accordions and controls
- **Performance tests**: Test efficiency of real-time audio processing

To run tests:
```bash
# Run all tests
npm run test

# Run tests with code coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For significant changes, please open an issue first to discuss what you would like to change.

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the developers.

## Frequently Asked Questions (FAQ)

### General Questions

1. **What microphone access permissions does the application require?**

   By default, permission is granted

2. **How does the application handle user refusal to grant microphone access?**

   Displays error message and continues working with limitations

3. **What camera access permissions does the application require?**

   We don't need camera access, we only use the microphone

### Functionality

4. **What audio formats are supported for export?**

   All possible formats

5. **How does the application handle situations when there is little free space on the device?**

   Warns the user

6. **Can hotkeys be configured for recording management?**

   Not yet, but planned in future versions

7. **Are plugins or extensions supported for additional functions?**

   Yes, all modules are implemented as plugins and can be enabled/disabled in settings

### User Interface

8. **What interface languages are supported?**

   English and Russian, multilingual support planned for the future

9. **Can the interface appearance be customized?**

   Yes, dark and light themes are available

10. **What screen sizes are supported?**

    The application is adapted for all screen sizes

### Technical Questions

11. **What are the minimum system requirements for the application?**

    The recorder should work on all devices with Web API support

12. **How does the application handle failures during recording?**

    Saves partially recorded and has recovery mechanism

13. **Is simultaneous use of multiple microphones supported?**

    No, only one microphone is supported

### Security and Privacy

14. **What data is transmitted to external servers?**

    Only during transcription/translation, with local operation data stays on the device

15. **How often is the application updated?**

    Automatically when a new version is available

16. **What precautions are taken when working with confidential recordings?**

    Local storage and encryption when necessary

### Usability

17. **How can a user get help or support?**

    Through the "Help" accordion in the application interface and documentation

18. **Are notifications about process completion supported?**

    Not yet, but planned, for example, audio notifications

19. **How can a user evaluate recording quality?**

    - Visual sound level indicator
    - Playback of recordings
    - Quality and performance statistics

    These modules can be disabled as plugins in settings

20. **Can automatic cleanup of recordings be configured?**

    Yes, can be configured by date in storage settings

### Architecture

**All modules (recording, transcription, translation, history, settings, etc.) are implemented as plugins and can be enabled/disabled in settings**