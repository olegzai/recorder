# Recorder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](VERSIONS.md)
[![Platform](https://img.shields.io/badge/platform-web-lightgrey.svg)](README.md)
[![TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-007ACC.svg)](https://www.typescriptlang.org/)
[![Web API](https://img.shields.io/badge/WebAPI-Compatible-FF69B4.svg)](https://developer.mozilla.org/en-US/docs/Web/API)

CSS-free, pure HTML+TypeScript+JavaScript browser-based audio recorder without a server, which works entirely in the browser without any backend dependencies. Includes speech transcription and translation features.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
  - [Project Structure](#project-structure)
  - [Module Architecture](#module-architecture)
  - [Data Flow](#data-flow)
  - [Plugin System Architecture](#plugin-system-architecture)
- [Interface](#interface)
  - [1. Recorder](#1-recorder)
  - [2. History](#2-history)
  - [3. Settings](#3-settings)
  - [4. Plugins](#4-plugins)
  - [5. Help](#5-help)
  - [6. Log](#6-log)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Building the Project](#building-the-project)
  - [Usage](#usage)
- [API Reference](#api-reference)
  - [Recording Functions](#recording-functions)
  - [Transcription and Translation Functions](#transcription-and-translation-functions)
  - [Plugin Management Functions](#plugin-management-functions)
  - [Configuration Parameters](#configuration-parameters)
  - [Usage Examples](#usage-examples)
- [Browser Support](#browser-support)
  - [Desktop Browsers](#desktop-browsers)
  - [Mobile Browsers](#mobile-browsers)
  - [Feature Support Matrix](#feature-support-matrix)
- [Security and Privacy](#security-and-privacy)
- [Limitations](#limitations)
- [Configuration](#configuration)
  - [Configuration Options Explained](#configuration-options-explained)
- [Performance](#performance)
  - [Performance Metrics](#performance-metrics)
  - [Performance Optimization Tips](#performance-optimization-tips)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Browser-Specific Issues](#browser-specific-issues)
  - [Advanced Troubleshooting](#advanced-troubleshooting)
- [Development Roadmap](#development-roadmap)
- [Changelog](#changelog)
- [Testing](#testing)
- [Contributing](#contributing)
  - [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Code Style](#code-style)
- [License](#license)
- [Support](#support)
- [Authors](#authors)
- [Credits](#credits)
- [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)
  - [How to Use This FAQ](#how-to-use-this-faq)
  - [General Questions](#general-questions)
  - [Functionality](#functionality)
  - [User Interface](#user-interface)
  - [Technical Questions](#technical-questions)
  - [Security and Privacy](#security-and-privacy)
  - [Usability](#usability)
  - [Architecture](#architecture-1)

## Overview

Recorder is a lightweight, standalone sound recording solution that uses modern browser APIs to capture, process, and store audio directly in the user's browser. No backend infrastructure is required - everything happens on the client side for maximum privacy and portability. The application also provides speech-to-text transcription capabilities (in Russian and English) and translation into various languages with subsequent voiceover.

## Features

- **Serverless Architecture**: Works entirely in the browser without backend dependencies
- **Privacy-Focused**: Audio recordings never leave the user's device
- **No CSS**: Completely devoid of CSS and any styling, only clean HTML structure
- **Modern Web APIs**: Uses MediaRecorder API and Web Audio API for high-quality recording
- **Cross-Platform Compatibility**: Works in all modern browsers supporting Web Audio (desktop and mobile)
- **Lightweight**: Minimal code footprint without external dependencies
- **Export Options**: Save recordings in multiple formats (WAV, MP3, OGG, WebM)
- **Transcription**: Ability to convert speech to text in Russian, English, and Ukrainian
- **Translation**: Function to translate transcribed text into different languages
- **Comprehensive Logging**: All application processes are logged for diagnostics
- **Typedoc Documentation**: API documentation generated with Typedoc
- **Real-time Transcription**: Live speech-to-text conversion with support for multiple languages
- **Voiceover**: Ability to voice over translated text
- **Silence Detection**: Automatic silence detection during recording
- **Automatic Cleanup**: Configure retention period for recordings and ability to fully clear
- **Future CSS Support**: In settings, ability to enable/disable CSS styling
- **Modular Architecture**: Fully modular project, code and files developed as independent modules
- **Single Build**: Compilation creates one final HTML file including all code
- **Plugin System**: All modules (recording, transcription, translation, history, settings, etc.) can be enabled/disabled as plugins

## Tech Stack

- **HTML5**: Semantic markup for recording interface
- **TypeScript**: Type-safe application logic and error handling
- **JavaScript**: Real-time execution and DOM manipulation
- **Web Audio API**: Audio processing and manipulation
- **MediaRecorder API**: Audio capture and encoding
- **Blob API**: File creation and download functionality
- **Web Speech API**: For speech-to-text transcription
- **Translation API Integrations**: For text translation and voiceover
- **Module System**: For organizing code into independent components

## Architecture

The application follows a modular architecture with clear separation of concerns. Audio data flows from the microphone through Web Audio API and MediaRecorder to client-side storage, with optional processing through transcription and translation services.

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
- `src/modules/` - Contains all application modules organized by functionality
- `dist/` - Build output
- `tests/` - Unit and integration tests
- `docs/` - Additional documentation
- `config/` - Configuration files for build and development

### Module Architecture

The project is built using a modular architecture where each component is presented as an independent module with clear interfaces:

- **AudioInputModule**: Handles microphone access and audio input processing
- **RecordingEngineModule**: Manages recording lifecycle (start/stop/pause)
- **AudioProcessingModule**: Applies filters and processes audio in real-time
- **EncodingModule**: Encodes audio into various formats (WAV, MP3, OGG, etc.)
- **FileManagerModule**: Manages file operations and recording exports
- **TranscriptionModule**: Converts speech to text using Web Speech API
- **TranslationModule**: Translates text between languages using external APIs
- **VoiceoverModule**: Generates speech from text using TTS engines
- **StorageModule**: Handles local storage using both localStorage and IndexedDB. The module has been enhanced to prevent localStorage quota exceeded errors by storing metadata separately for each recording, allowing for better scalability with multiple recordings.
- **UILayoutModule**: Manages UI components and accordion interface
- **SettingsModule**: Manages application configuration and preferences
- **LoggingModule**: Handles application logging and diagnostics
- **PluginManagerModule**: Controls plugin activation and deactivation

During compilation, all modules are combined into a single final HTML file including all necessary code.

### Data Flow

The application follows a unidirectional data flow:

1. **Input**: Audio captured from microphone via Web Audio API
2. **Processing**: Real-time audio processing and filtering
3. **Encoding**: Conversion to desired output format
4. **Storage**: Saving to client-side storage (Blob) using localStorage for metadata and IndexedDB for audio data to prevent quota exceeded errors
5. **Export**: Download/export functionality
6. **Analysis**: Transcription and translation services
7. **Output**: Playback and voiceover capabilities

### Plugin System Architecture

The plugin system enables modular functionality. Each plugin operates independently and can be enabled/disabled through the settings interface. The Plugin Manager controls activation and deactivation of individual modules, allowing users to customize the application functionality according to their needs.

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

Recordings are stored using a hybrid approach: audio data is stored in IndexedDB for large files, while metadata is stored in localStorage using separate entries per recording to prevent quota exceeded errors. This ensures maximum possible long-term storage between sessions. History is sorted from newest to oldest recordings.

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
git clone https://github.com/olegzai/recorder.git
cd recorder

# Open in browser (macOS)
open index.html

# Open in browser (Linux)
xdg-open index.html

# Open in browser (Windows)
start index.html
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

# Build for production
npm run build
```

#### Local Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open your browser to the provided URL

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

#### Quick Start Guide
- **Record**: Click the "Record" button to begin recording
- **Stop**: Click the "Stop" button to end recording
- **Transcribe**: Convert speech to text using the "Transcribe" button
- **Translate**: Translate text to another language using the "Translate" button
- **Voiceover**: Listen to translated text using the "Voiceover" button
- **Settings**: Adjust recording quality and other parameters
- **History**: Access your saved recordings and their metadata
- **Plugins**: Enable/disable functionality as needed

#### Tips for Best Quality
- Use headphones to prevent feedback
- Record in a quiet environment
- Position microphone appropriately
- Adjust bitrate and sample rate for your needs

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

### Usage Examples

#### Basic Recording
```javascript
// Start recording
startRecording();

// Stop recording after 10 seconds
setTimeout(() => {
  stopRecording();
}, 10000);
```

#### Transcription
```javascript
// Transcribe audio to text
const audioBlob = new Blob([audioData], { type: 'audio/wav' });
const transcription = await transcribeAudio(audioBlob, 'en');
console.log(transcription);
```

#### Plugin Management
```javascript
// Enable transcription plugin
enablePlugin('transcription');

// Check if translation plugin is enabled
if (isPluginEnabled('translation')) {
  // Perform translation
}
```

## Browser Support

### Desktop Browsers
- Chrome 49+ (full support)
- Firefox 43+ (partial Web Speech API support)
- Safari 14+ (with limitations)
- Edge 79+ (full support)
- Opera 36+ (full support)

### Mobile Browsers
- Chrome for Android (full support)
- Safari on iOS (with limitations)
- Firefox for Mobile (partial support)

### Feature Support Matrix
| Feature | Chrome | Firefox | Safari | Edge | Opera |
|---------|--------|---------|--------|------|-------|
| MediaRecorder API | ✅ | ✅ | ❌ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ | ✅ |
| Web Speech API | ✅ | ⚠️ | ❌ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ | ✅ |

⚠️ = Partial support
❌ = Not supported
✅ = Full support

## Security and Privacy

- All audio processing occurs on the client side
- Data is not sent to external servers (except for transcription/translation API requests)
- Explicit user permission required for microphone access
- Recording stops when user leaves the page
- Silence detection support for recording optimization
- Secure local storage of confidential recordings using IndexedDB for audio data and localStorage for metadata

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

### Configuration Options Explained

#### Sample Rate
- **8000 Hz**: Low quality, small file size (suitable for voice only)
- **11025 Hz**: Low quality, slightly better than 8000 Hz
- **22050 Hz**: Medium quality, moderate file size
- **44100 Hz**: CD quality, standard for most applications
- **48000 Hz**: DVD quality, standard for video applications
- **96000 Hz**: High fidelity, very large file size

#### Bitrate
- **64 kbps**: Low quality, suitable for voice
- **128 kbps**: Standard quality, good balance of size and quality
- **192 kbps**: High quality, larger file size
- **320 kbps**: Maximum quality, largest file size

#### Audio Formats
- **WAV**: Uncompressed, high quality, large file size
- **MP3**: Compressed, good quality, smaller file size
- **OGG**: Compressed, good quality, open format
- **WebM**: Compressed, designed for web use

## Performance

The application is optimized for browser operation:

- Uses minimal system resources
- Audio processing occurs in real-time
- Efficient memory management for long recordings
- Optimization for devices with limited resources

### Performance Metrics

#### Memory Usage
- **Idle**: ~5-10 MB RAM
- **Recording**: ~15-25 MB RAM
- **Transcribing**: ~20-35 MB RAM
- **Translating**: ~15-30 MB RAM

#### Processing Time
- **Real-time recording**: 1x speed (real-time)
- **Transcription**: ~10-30 seconds per minute of audio
- **Translation**: ~5-15 seconds per minute of audio
- **Export**: ~1-5 seconds per minute of audio

#### Supported Recording Lengths
- **Short recordings**: Up to 10 minutes (recommended)
- **Medium recordings**: 10-30 minutes (possible)
- **Long recordings**: 30+ minutes (requires sufficient memory)

### Performance Optimization Tips
- Close other browser tabs to free memory
- Use headphones to prevent feedback (reduces processing)
- Choose appropriate sample rate and bitrate for your needs
- Regularly clear old recordings to free storage
- Use WAV format for faster processing (larger files)
- Use compressed formats (MP3/OGG) for smaller files (slower processing)

## Troubleshooting

If you have problems with the application:

### Common Issues

1. **Microphone access problems**:
   - Check browser permissions for microphone access
   - Ensure microphone is not used by other applications
   - Reload page and grant permission again
   - Check that microphone is properly connected

2. **Transcription/translation problems**:
   - Check internet connection
   - Ensure Web Speech API is supported by your browser
   - Try using a different language for transcription
   - Verify that you have internet access for API calls

3. **Performance problems**:
   - Close other browser tabs to free memory
   - Check available space on device
   - Update browser to the latest version
   - Reduce sample rate or bitrate settings

4. **Storage quota exceeded errors**:
   - The application now uses a hybrid approach with IndexedDB for audio data and localStorage for metadata to prevent quota exceeded errors
   - If you encounter storage issues, try clearing old recordings through the automatic cleanup settings
   - The application manages storage efficiently to accommodate multiple recordings

### Browser-Specific Issues

#### Chrome
- **Microphone access**: Check chrome://settings/content/microphone
- **Extensions**: Disable extensions that might interfere with audio
- **Flags**: Check chrome://flags/#enable-experimental-web-platform-features

#### Firefox
- **Permissions**: Check about:preferences#privacy
- **Security**: May require HTTPS for microphone access
- **Settings**: Check media.getusermedia.screensharing.allowed_domains in about:config

#### Safari
- **Permissions**: Check Safari > Preferences > Websites > Camera/Microphone
- **Security**: May require HTTPS for Web Speech API
- **Version**: Limited support for MediaRecorder API

### Advanced Troubleshooting

#### Debugging
- Open browser developer tools (F12)
- Check Console tab for error messages
- Check Network tab for failed API requests
- Look for warnings about deprecated APIs

#### Diagnostic Information
- Browser version and operating system
- Available memory and storage
- Network connectivity status
- Microphone and audio device status

### When to Report Issues
Report issues when:
- Following all troubleshooting steps doesn't resolve the problem
- Error messages indicate a bug in the application
- Feature doesn't work as documented
- Performance is significantly below expectations

## Development Roadmap

Detailed versioning plan and development stages are described in the [VERSIONS.md](VERSIONS.md) file.

Development proceeds using modular architecture where each functional block is implemented as an independent module, which is then integrated into the final build.

### Phase 1: Core Functionality
- [x] Basic audio recording function
- [x] Playback of recordings in interface
- [x] Adding metadata to recordings

### Phase 2: Processing Features
- [x] Speech transcription (Russian and English)
- [x] Translation to different languages
- [x] Voiceover of translated text
- [x] Silence detection

### Phase 3: Advanced Features
- [x] Automatic cleanup by settings
- [x] Export logs
- [x] PWA (Progressive Web App) support
- [x] Modular architecture with plugins

### Phase 4: Extended Capabilities
- [ ] Advanced audio editing capabilities
- [ ] Cloud storage integration (optional)
- [ ] Multi-user support
- [ ] Collaboration features

## Changelog

Detailed changes for each release are documented in the [VERSIONS.md](VERSIONS.md) file.

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

# Run specific test file
npm run test -- path/to/test-file.spec.ts
```

#### Test Structure
Tests are organized in the `tests/` directory with the following structure:
- `unit/` - Unit tests for individual modules
- `integration/` - Integration tests for module interactions
- `ui/` - UI tests for interface components
- `performance/` - Performance tests for audio processing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For significant changes, please open an issue first to discuss what you would like to change.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Reporting Bugs
If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce the issue
- Expected and actual behavior
- Browser and OS information

### Suggesting Enhancements
For feature requests, please provide:
- Clear description of the enhancement
- Use cases for the feature
- Possible implementation approaches

### Code Style
Please follow these guidelines when contributing code:
- Use consistent indentation (2 spaces for TypeScript/JavaScript)
- Write clear, descriptive variable and function names
- Add comments for complex logic
- Follow existing code patterns in the project

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the developers.

## Authors

- **Oleg Zai** - Initial work and main developer

See also the list of [contributors](https://github.com/olegzai/recorder/contributors) who participated in this project.

## Credits

This project uses the following technologies and APIs:

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - For audio processing
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) - For audio capture
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) - For speech recognition
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - For data storage
- [Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob) - For file operations

## Frequently Asked Questions (FAQ)

### How to Use This FAQ

This section addresses common questions about the Recorder application. If your question is not answered here, please check the [documentation](#) or [contact us](#support).

### General Questions

1. **What microphone access permissions does the application require?**

   The application requires microphone access permission to record audio. When you first click the record button, your browser will prompt you to allow microphone access. You must grant this permission for the application to function properly.

2. **How does the application handle user refusal to grant microphone access?**

   If you refuse to grant microphone access, the application will display an error message and continue working with limited functionality. You won't be able to record audio, but you can still view existing recordings and adjust settings.

3. **What camera access permissions does the application require?**

   The application does not require camera access. It only uses the microphone for audio recording functionality.

### Functionality

4. **What audio formats are supported for export?**

   The application supports exporting recordings in multiple formats including WAV, MP3, OGG, and WebM. You can select your preferred format in the settings panel.

5. **How does the application handle situations when there is little free space on the device?**

   The application monitors available storage space and will warn you if storage is running low. You can configure automatic cleanup settings to remove older recordings and free up space.

6. **Can hotkeys be configured for recording management?**

   Hotkey functionality is not currently available but is planned for future versions. The current interface relies on clicking buttons for recording controls.

7. **Are plugins or extensions supported for additional functions?**

   Yes, all major modules (recording, transcription, translation, history, settings, etc.) are implemented as plugins and can be enabled or disabled in the settings panel.

### User Interface

8. **What interface languages are supported?**

   The application currently supports English and Russian interfaces. Multilingual support for additional languages is planned for future releases.

9. **Can the interface appearance be customized?**

   Yes, the application offers both dark and light theme options. You can switch between themes in the settings panel.

10. **What screen sizes are supported?**

    The application is responsive and adapts to all screen sizes, from mobile phones to desktop monitors, ensuring optimal viewing and usability across devices.

### Technical Questions

11. **What are the minimum system requirements for the application?**

    The application should work on any device with a modern browser that supports Web APIs (Web Audio API, MediaRecorder API, Web Speech API). Most devices manufactured in the last 5 years meet these requirements.

12. **How does the application handle failures during recording?**

    The application implements error handling mechanisms to save partially recorded audio in case of unexpected interruptions. A recovery mechanism attempts to restore the recording session when possible.

13. **Is simultaneous use of multiple microphones supported?**

    No, the application currently supports only one microphone at a time. Using multiple microphones simultaneously is not supported.

### Security and Privacy

14. **What data is transmitted to external servers?**

    Audio recordings remain on your device and are not transmitted to external servers. However, transcription and translation services require sending text data to external APIs when these features are used.

15. **How often is the application updated?**

    Updates are released periodically as new features are added or bugs are fixed. The application will notify you when a new version is available.

16. **What precautions are taken when working with confidential recordings?**

    All recordings are stored locally on your device using secure storage mechanisms (IndexedDB for audio data and localStorage for metadata). No audio data is transmitted to external servers unless you specifically use online transcription or translation services.

### Usability

17. **How can a user get help or support?**

    Help is available through the "Help" accordion in the application interface and through the documentation provided in this README file. You can also open an issue in the GitHub repository for additional support.

18. **Are notifications about process completion supported?**

    Process completion notifications are not currently available but are planned for future versions. Audio notifications for various events are also under consideration.

19. **How can a user evaluate recording quality?**

    The application provides several ways to evaluate recording quality:
    - Visual sound level indicator during recording
    - Immediate playback of recordings
    - Quality and performance statistics in the log panel

    These modules can be disabled as plugins in settings if not needed.

20. **Can automatic cleanup of recordings be configured?**

    Yes, you can configure automatic cleanup of recordings by date in the storage settings. Options include keeping recordings forever, deleting after 7, 30, or 90 days, or performing a full cleanup.

### Architecture

21. **How are modules implemented and managed in the application?**

    All modules (recording, transcription, translation, history, settings, etc.) are implemented as plugins and can be enabled or disabled in the settings panel. This modular architecture allows for customization of functionality based on user needs.
