const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Compile TypeScript to JavaScript
console.log('Compiling TypeScript...');
execSync('npx tsc --skipLibCheck', { stdio: 'inherit' });

// Read all JavaScript files from dist
const jsFiles = [];
const distDir = './dist';
readFilesRecursively(distDir, '.js', jsFiles);

// Create the single HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recorder v0.0.1</title>
</head>
<body>
    <div id="app">
        <!-- Accordions Interface -->
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

        <details>
            <summary>History</summary>
            <div class="history-panel">
                <ul id="recordingsList">
                    <!-- Recordings will appear here in order from newest to oldest -->
                </ul>
            </div>
        </details>

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

        <details>
            <summary>Help</summary>
            <div class="help-panel">
                <h3>Documentation</h3>
                <p>To get help on using the application, see the Frequently Asked Questions (FAQ) section below.</p>
                <h3>Support</h3>
                <p>If you have problems, open an issue in the project repository.</p>
            </div>
        </details>

        <details>
            <summary>Log</summary>
            <div class="log-panel">
                <pre id="logOutput"></pre>
                <button id="exportLogsBtn">Export logs</button>
            </div>
        </details>
    </div>

    <script>
        // All compiled JavaScript code will be embedded here
        ${jsFiles
          .map((file) => {
            const content = fs.readFileSync(file, 'utf8');
            return `// Source: ${file}\n${content}`;
          })
          .join('\n\n')}
    </script>
</body>
</html>`;

// Write the final HTML file
fs.writeFileSync('./dist/index.html', htmlContent);
console.log('Build completed! Single HTML file created at ./dist/index.html');

// Helper function to recursively read files
function readFilesRecursively(dir, extension, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readFilesRecursively(filePath, extension, fileList);
    } else if (path.extname(file) === extension) {
      fileList.push(filePath);
    }
  }

  return fileList;
}
