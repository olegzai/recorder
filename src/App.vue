<template>
    <div id="app">
        <!-- Accordions Interface -->
        <details id="recorder-accordion" open>
            <summary>Recorder</summary>
            <div class="recorder-controls">
                <button id="recordBtn" @click="startRecording">Record</button>
                <button
                    id="stopBtn"
                    @click="stopRecording"
                    :disabled="!isRecording"
                >
                    Stop
                </button>
                <div id="recorderStatus">{{ status }}</div>
                <div id="voiceTranscriptionControls">
                    <button
                        id="transcribeBtn"
                        @click="transcribeAudio"
                        :disabled="!currentRecording"
                    >
                        Transcribe
                    </button>
                    <button
                        id="translateBtn"
                        @click="translateText"
                        :disabled="!transcription"
                    >
                        Translate
                    </button>
                    <button
                        id="voiceoverBtn"
                        @click="playVoiceover"
                        :disabled="!translation"
                    >
                        Voiceover
                    </button>
                </div>
            </div>
        </details>

        <details id="history-accordion">
            <summary>History</summary>
            <div class="history-panel">
                <ul id="recordingsList">
                    <li
                        v-for="recording in recordings"
                        :key="recording.id"
                        class="recording-item"
                    >
                        <div class="recording-info">
                            <strong>{{ recording.title }}</strong>
                            <span class="recording-meta"
                                >{{ formatDate(recording.timestamp) }} •
                                {{ formatDuration(recording.duration) }} •
                                {{ recording.format }}</span
                            >
                        </div>
                        <div class="recording-actions">
                            <audio controls :src="recording.url"></audio>
                            <button
                                class="delete-recording-btn"
                                @click="deleteRecording(recording.id)"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </details>

        <details id="settings-accordion">
            <summary>Settings</summary>
            <div class="settings-panel">
                <div>
                    <label
                        >Sample Rate:
                        <input
                            type="number"
                            v-model.number="settings.sampleRate"
                    /></label>
                </div>
                <div>
                    <label
                        >Bitrate:
                        <input type="number" v-model.number="settings.bitrate"
                    /></label>
                </div>
                <div>
                    <label
                        >Format:
                        <select v-model="settings.audioFormat">
                            <option value="wav">WAV</option>
                            <option value="mp3">MP3</option>
                            <option value="ogg">OGG</option>
                            <option value="webm">WebM</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label
                        >Transcription Language:
                        <select v-model="settings.transcriptionLang">
                            <option value="ru">Russian</option>
                            <option value="en">English</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label
                        >Translation Language:
                        <select v-model="settings.translationLang">
                            <option value="en">English</option>
                            <option value="ru">Russian</option>
                            <option value="de">German</option>
                            <option value="fr">French</option>
                            <option value="es">Spanish</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label
                        >Retention Period:
                        <select v-model="settings.retentionPeriod">
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
                <label
                    ><input type="checkbox" v-model="plugins.recorderEnabled" />
                    Recording Module</label
                >
                <label
                    ><input
                        type="checkbox"
                        v-model="plugins.transcriptionEnabled"
                    />
                    Transcription Module</label
                >
                <label
                    ><input
                        type="checkbox"
                        v-model="plugins.translationEnabled"
                    />
                    Translation Module</label
                >
                <label
                    ><input
                        type="checkbox"
                        v-model="plugins.voiceoverEnabled"
                    />
                    Voiceover Module</label
                >
                <label
                    ><input type="checkbox" v-model="plugins.historyEnabled" />
                    History</label
                >
                <label
                    ><input type="checkbox" v-model="plugins.settingsEnabled" />
                    Settings</label
                >
            </div>
        </details>

        <details id="help-accordion">
            <summary>Help</summary>
            <div class="help-panel">
                <h3>Documentation</h3>
                <p>
                    To get help on using the application, see the Frequently
                    Asked Questions (FAQ) section below.
                </p>
                <h3>Support</h3>
                <p>
                    If you have problems, open an issue in the project
                    repository.
                </p>
            </div>
        </details>

        <details id="log-accordion">
            <summary>Log</summary>
            <div class="log-panel">
                <pre id="logOutput">{{ logEntries.join("\n") }}</pre>
                <button id="exportLogsBtn" @click="exportLogs">
                    Export logs
                </button>
            </div>
        </details>
        
        <details id="storage-accordion">
            <summary>Storage</summary>
            <div class="storage-panel">
                <div id="storageInfo">
                    <p><strong>Used:</strong> <span id="usedSpace">{{ formatBytes(storageInfo.used) }}</span></p>
                    <p><strong>Total Quota:</strong> <span id="totalQuota">{{ formatBytes(storageInfo.quota) }}</span></p>
                    <p><strong>Percentage Used:</strong> <span id="percentUsed">{{ storageInfo.percentUsed }}%</span></p>
                    <progress id="storageMeter" :value="storageInfo.percentUsed" max="100"></progress>
                </div>
                <button id="clearStorageBtn" @click="clearAllStorage">
                    Clear All Recordings
                </button>
                <button id="clearAllStorageBtn" @click="clearAllStorageAndCache">
                    Clear All Data (Recordings + Cache)
                </button>
            </div>
        </details>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { audioModule } from './modules/AudioModule';
import { loggingModule } from './modules/logging';
import { fixedStorageModule as storageModule } from './modules/storage/FixedStorageModule';
import { appLogger } from './modules/LoggerModule';
import {
  type LanguageCode,
  transcriptionModule,
} from './modules/TranscriptionModule';
import type { Plugins, Recording, Settings } from './types';

// Состояние приложения
const status = ref('Ready to record');
const isRecording = ref(false);
const currentRecording = ref<Blob | null>(null);
const currentStream = ref<MediaStream | null>(null);
const transcription = ref('');
const translation = ref('');

// Список записей
const recordings = ref<Recording[]>([]);

// Store the object URLs to revoke them later to prevent memory leaks
const objectUrls = ref<string[]>([]);

// Storage information
const storageInfo = ref({
  used: 0,
  quota: 0,
  percentUsed: 0
});

// Настройки
const settings = ref<Settings>({
  sampleRate: 44100,
  bitrate: 128000,
  audioFormat: 'webm',
  transcriptionLang: 'en',
  translationLang: 'en',
  retentionPeriod: 'never',
});

// Плагины
const plugins = ref<Plugins>({
  recorderEnabled: true,
  transcriptionEnabled: true,
  translationEnabled: true,
  voiceoverEnabled: true,
  historyEnabled: true,
  settingsEnabled: true,
});

// Логи
const logEntries = ref<string[]>([]);

// Вычисляемые свойства
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return [h, m, s]
    .map((v) => v.toString().padStart(2, '0'))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};

// Методы
const log = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  // Добавляем сообщение в локальный массив для отображения в UI
  const timestamp = new Date().toISOString();
  logEntries.value.push(`[${timestamp}] [${level.toUpperCase()}] ${message}`);

  // Также записываем в модуль логирования
  switch (level) {
    case 'info':
      appLogger.info(message);
      break;
    case 'warn':
      appLogger.warn(message);
      break;
    case 'error':
      appLogger.error(message);
      break;
  }
};

const startRecording = async () => {
  try {
    status.value = 'Initializing audio input...';
    log('Initializing audio input');

    // Инициализируем аудио модуль
    const stream = await audioModule.initialize({
      sampleRate: settings.value.sampleRate,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });

    currentStream.value = stream;

    // Начинаем запись
    await audioModule.startRecording(stream, {
      mimeType: `audio/${settings.value.audioFormat}`,
      audioBitsPerSecond: settings.value.bitrate,
    });

    status.value = 'Recording... Press STOP to finish';
    isRecording.value = true;
    log('Recording started');
  } catch (error) {
    status.value = `Error: ${(error as Error).message}`;
    log(`Recording error: ${(error as Error).message}`, 'error');
  }
};

const stopRecording = async () => {
  try {
    status.value = 'Stopping recording...';
    log('Stopping recording');

    // Останавливаем запись
    const audioBlob = await audioModule.stopRecording();
    log(`Audio blob created with size: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
    currentRecording.value = audioBlob;
    isRecording.value = false;

    // Создаем метаданные записи
    const metadata = {
      title: `Recording ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      duration: 0, // В реальном приложении это будет точная длительность
      format: settings.value.audioFormat,
      language: settings.value.transcriptionLang,
    };

    log(`Attempting to save recording with metadata: ${JSON.stringify(metadata)}`);

    // Сохраняем запись
    const id = await storageModule.saveRecording(audioBlob, metadata);
    log(`Recording saved with ID: ${id}`);

    // Обновляем список записей
    // Revoke previously created object URLs to prevent memory leaks
    objectUrls.value.forEach(url => URL.revokeObjectURL(url));
    objectUrls.value = [];
    log('Cleared previous object URLs');

    const allRecordings = await storageModule.getAllRecordings();
    log(`After saving, retrieved ${allRecordings.length} recordings from storage`);
    
    // Преобразуем записи в нужный формат для отображения
    recordings.value = allRecordings.map((rec, index) => {
      log(`Transforming recording ${index + 1}/${allRecordings.length}: ID=${rec.id}, hasBlob=${!!rec.blob}`);
      const url = URL.createObjectURL(rec.blob);
      objectUrls.value.push(url); // Track the URL for later cleanup
      log(`Created object URL for recording ${rec.id}: ${url}`);
      
      return {
        id: rec.id,
        title: rec.metadata.title || `Recording ${new Date(rec.metadata.timestamp || Date.now()).toLocaleString()}`,
        timestamp: rec.metadata.timestamp || Date.now(),
        duration: rec.metadata.duration || 0,
        format: rec.metadata.format || 'unknown',
        url: url,
        language: rec.metadata.language,
        transcription: rec.metadata.transcription,
        translation: rec.metadata.translation,
      };
    });

    status.value = 'Recording saved!';
    log(`Updated recordings list now has ${recordings.value.length} items`);
    
    // Update storage information after saving
    await updateStorageInfo();
  } catch (error) {
    status.value = `Error: ${(error as Error).message}`;
    log(`Stop recording error: ${(error as Error).message}`, 'error');
    log(`Stop recording error stack: ${(error as Error).stack}`, 'error');
  }
};

const transcribeAudio = async () => {
  if (!currentRecording.value) {
    log('No recording to transcribe', 'warn');
    return;
  }

  try {
    log('Starting transcription...', 'info');

    if (!transcriptionModule.isAvailable()) {
      log('Web Speech API not supported in this browser', 'error');
      // Fallback to simulated transcription
      transcription.value = 'This is a simulated transcription of the audio.';
      log('Audio transcribed (simulated)');
      return;
    }

    // Set up callbacks for transcription results
    transcriptionModule.setCallbacks({
      onResult: (result) => {
        transcription.value = result.text;
        log(`Transcription result: ${result.text.substring(0, 50)}...`);
      },
      onError: (error) => {
        log(`Transcription error: ${error.message}`, 'error');
      },
      onStart: () => {
        log('Transcription started', 'info');
      },
      onStop: () => {
        log('Transcription stopped', 'info');
      },
    });

    // Determine language from settings
    const language = settings.value.transcriptionLang as LanguageCode;

    // Start transcription
    await transcriptionModule.startTranscription({
      language: language,
      interimResults: true,
      continuous: false,
    });

    log('Transcription initiated');
  } catch (error) {
    log(`Transcription failed: ${(error as Error).message}`, 'error');
  }
};

const translateText = () => {
  if (!transcription.value) {
    log('No transcription to translate', 'warn');
    return;
  }

  // Здесь будет логика перевода
  translation.value = 'Это симуляция перевода текста.';
  log('Text translated');
};

const playVoiceover = () => {
  if (!translation.value) {
    log('No translation for voiceover', 'warn');
    return;
  }

  // Здесь будет логика озвучки
  log('Playing voiceover');
};

const deleteRecording = async (id: string) => {
  try {
    log(`Attempting to delete recording with ID: ${id}`);
    await storageModule.deleteRecording(id);
    log(`Recording ${id} deleted from storage`);
    
    // Revoke previously created object URLs to prevent memory leaks
    objectUrls.value.forEach(url => URL.revokeObjectURL(url));
    objectUrls.value = [];
    log('Cleared previous object URLs after deletion');

    const allRecordings = await storageModule.getAllRecordings();
    log(`After deletion, retrieved ${allRecordings.length} recordings from storage`);
    
    // Преобразуем записи в нужный формат для отображения
    recordings.value = allRecordings.map((rec, index) => {
      log(`Transforming recording ${index + 1}/${allRecordings.length} after deletion: ID=${rec.id}, hasBlob=${!!rec.blob}`);
      const url = URL.createObjectURL(rec.blob);
      objectUrls.value.push(url); // Track the URL for later cleanup
      log(`Created object URL for recording ${rec.id}: ${url}`);
      
      return {
        id: rec.id,
        title: rec.metadata.title || `Recording ${new Date(rec.metadata.timestamp || Date.now()).toLocaleString()}`,
        timestamp: rec.metadata.timestamp || Date.now(),
        duration: rec.metadata.duration || 0,
        format: rec.metadata.format || 'unknown',
        url: url,
        language: rec.metadata.language,
        transcription: rec.metadata.transcription,
        translation: rec.metadata.translation,
      };
    });
    log(`Recording ${id} deleted. Now showing ${recordings.value.length} recordings in UI`);
    
    // Update storage information after deletion
    await updateStorageInfo();
  } catch (error) {
    log(`Error deleting recording: ${(error as Error).message}`, 'error');
    log(`Delete recording error stack: ${(error as Error).stack}`, 'error');
  }
};

const exportLogs = async () => {
  try {
    await loggingModule.exportLogs(
      `recorder_logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`,
    );
    log('Logs exported successfully');
  } catch (error) {
    log(`Error exporting logs: ${(error as Error).message}`, 'error');
  }
};

// Format bytes to human readable format
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Update storage information display
const updateStorageInfo = async () => {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      storageInfo.value.used = estimate.usage || 0;
      storageInfo.value.quota = estimate.quota || 0;
      
      if (estimate.quota) {
        storageInfo.value.percentUsed = Math.round((estimate.usage || 0) * 100 / estimate.quota);
      } else {
        storageInfo.value.percentUsed = 0;
      }
      
      log(`Storage usage: ${formatBytes(estimate.usage || 0)} / ${formatBytes(estimate.quota || 0)} (${storageInfo.value.percentUsed}%)`);
    } else {
      log('Storage estimation not supported in this browser', 'warn');
    }
  } catch (error) {
    log(`Error getting storage info: ${(error as Error).message}`, 'error');
  }
};

// Clear all recordings
const clearAllStorage = async () => {
  try {
    await storageModule.clearAllRecordings();
    recordings.value = [];
    
    // Revoke all object URLs
    objectUrls.value.forEach(url => URL.revokeObjectURL(url));
    objectUrls.value = [];
    
    log('All recordings cleared');
    await updateStorageInfo();
  } catch (error) {
    log(`Error clearing recordings: ${(error as Error).message}`, 'error');
  }
};

// Clear all data including cache and other storage
const clearAllStorageAndCache = async () => {
  try {
    // Clear all recordings
    await storageModule.clearAllRecordings();
    recordings.value = [];
    
    // Revoke all object URLs
    objectUrls.value.forEach(url => URL.revokeObjectURL(url));
    objectUrls.value = [];
    
    // Clear IndexedDB databases
    const databases = await indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
    for (const dbInfo of databases) {
      indexedDB.deleteDatabase(dbInfo.name);
    }
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage if any
    sessionStorage.clear();
    
    log('All data cleared (recordings, cache, localStorage, sessionStorage)');
    
    // Reload the page to reset everything
    window.location.reload();
  } catch (error) {
    log(`Error clearing all data: ${(error as Error).message}`, 'error');
  }
};

// Инициализация
onMounted(async () => {
  log('Application mounted');

  try {
    log('Attempting to initialize storage module...');
    // Инициализируем хранилище
    await storageModule.initialize();
    log('Storage module initialized successfully');
  } catch (e) {
    log(`Error initializing storage module: ${(e as Error).message}`, 'error');
    log(`Storage initialization error stack: ${(e as Error).stack}`, 'error');
    return; // Exit if storage initialization fails
  }

  // Загрузка сохраненных записей из хранилища
  try {
    log('Attempting to load recordings from storage...');
    
    // Revoke previously created object URLs to prevent memory leaks
    objectUrls.value.forEach(url => URL.revokeObjectURL(url));
    objectUrls.value = [];
    log(`Cleared ${objectUrls.value.length} previous object URLs (before loading)`);

    log('Calling storageModule.getAllRecordings()...');
    log('About to call storageModule.getAllRecordings()...');
    const allRecordings = await storageModule.getAllRecordings();
    log(`Retrieved ${allRecordings.length} recordings from storage module`);
    
    if (allRecordings.length === 0) {
      // Let's check what's in the metadata store
      const metadataStore = JSON.parse(localStorage.getItem('recorder_metadata') || '{}');
      log(`Metadata store contents: ${JSON.stringify(metadataStore)}`);
      log(`Number of items in metadata store: ${Object.keys(metadataStore).length}`);
      
      // Try to get a specific recording if we know an ID
      const knownIds = Object.keys(metadataStore);
      if (knownIds.length > 0) {
        log(`Attempting to get recording with ID: ${knownIds[0]}`);
        try {
          const specificRecording = await storageModule.getRecording(knownIds[0]);
          log(`Specific recording result: ${JSON.stringify(specificRecording ? 'found' : 'not found')}`);
          if (specificRecording) {
            log(`Specific recording blob size: ${specificRecording.blob?.size}`);
          }
        } catch (err) {
          log(`Error getting specific recording: ${(err as Error).message}`, 'error');
        }
      }
      
      log('No recordings found in storage', 'info');
    } else {
      log(`First recording ID: ${allRecordings[0]?.id}`, 'info');
      log(`First recording metadata: ${JSON.stringify(allRecordings[0]?.metadata)}`, 'info');
    }

    // Преобразуем записи в нужный формат для отображения
    recordings.value = allRecordings.map((rec, index) => {
      log(`Processing recording ${index + 1}: ID=${rec.id}, hasBlob=${!!rec.blob}, blobSize=${rec.blob?.size}`);
      const url = URL.createObjectURL(rec.blob);
      objectUrls.value.push(url); // Track the URL for later cleanup
      log(`Created object URL for recording ${rec.id}: ${url}`);
      
      return {
        id: rec.id,
        title: rec.metadata.title || `Recording ${new Date(rec.metadata.timestamp || Date.now()).toLocaleString()}`,
        timestamp: rec.metadata.timestamp || Date.now(),
        duration: rec.metadata.duration || 0,
        format: rec.metadata.format || 'unknown',
        url: url,
        language: rec.metadata.language,
        transcription: rec.metadata.transcription,
        translation: rec.metadata.translation,
      };
    });
    
    log(`Successfully loaded and transformed ${recordings.value.length} recordings for display`);
    log(`Current recordings array: ${JSON.stringify(recordings.value.map(r => ({ id: r.id, title: r.title })))}`);
  } catch (e) {
    log(`Error loading recordings from storage: ${(e as Error).message}`, 'error');
    log(`Error stack: ${(e as Error).stack}`, 'error');
  }
  
  // Update storage information after loading
  await updateStorageInfo();
});

// Очистка ресурсов при размонтировании
onUnmounted(async () => {
  log('Application unmounting');

  // Revoke all object URLs to prevent memory leaks
  objectUrls.value.forEach(url => URL.revokeObjectURL(url));
  objectUrls.value = [];

  // Останавливаем активную запись если она есть
  if (isRecording.value) {
    await audioModule.stopRecording();
  }

  // Очищаем аудио ресурсы
  await audioModule.cleanup();
});
</script>

<style>
/* Стили для приложения */
#app {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

details {
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 10px;
    padding: 5px;
}

summary {
    padding: 10px;
    cursor: pointer;
    font-weight: bold;
    background-color: #f0f0f0;
    border-radius: 4px;
}

.recorder-controls,
.history-panel,
.settings-panel,
.plugins-panel,
.help-panel,
.log-panel {
    padding: 15px;
}

button {
    padding: 8px 16px;
    margin: 5px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

input,
select {
    padding: 5px;
    margin: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.recording-item {
    border-bottom: 1px solid #eee;
    padding: 10px 0;
}

.recording-info {
    margin-bottom: 10px;
}

.recording-meta {
    font-size: 0.9em;
    color: #666;
}

.recording-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

audio {
    width: 200px;
}

#logOutput {
    height: 200px;
    overflow-y: scroll;
    background-color: #f5f5f5;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>
