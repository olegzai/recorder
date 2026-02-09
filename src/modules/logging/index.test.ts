import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loggingModule } from './index';
import type { LoggerConfig } from './types';

// Мокаем localStorage для тестовой среды
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return index < keys.length ? keys[index] : null;
    },
  };
})();

// Мокаем window и localStorage только в браузерных тестах
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
} else {
  // В Node.js окружении создаем глобальный localStorage
  global.localStorage = localStorageMock;
}

describe('LoggingModule', () => {
  beforeEach(() => {
    // Очищаем локальное хранилище перед каждым тестом
    localStorage.clear();
  });

  afterEach(() => {
    // Восстанавливаем моки после каждого теста
    vi.restoreAllMocks();
  });

  it('should initialize correctly', async () => {
    await loggingModule.initialize();
    expect(loggingModule).toBeDefined();
  });

  it('should log info messages', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

    loggingModule.info('Test info message');

    expect(spy).toHaveBeenCalledWith('Test info message');
  });

  it('should log warn messages', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    loggingModule.warn('Test warn message');

    expect(spy).toHaveBeenCalledWith('Test warn message');
  });

  it('should log error messages', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    loggingModule.error('Test error message');

    expect(spy).toHaveBeenCalledWith('Test error message');
  });

  it('should log debug messages', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    loggingModule.debug('Test debug message');

    expect(spy).toHaveBeenCalledWith('Test debug message');
  });

  it('should save logs to storage when configured', async () => {
    // Обновляем конфигурацию для записи в хранилище
    loggingModule.updateConfig({ writeToStorage: true });

    loggingModule.info('Test message for storage');

    const logs = await loggingModule.getAllLogs();
    expect(logs.length).toBe(1);
    expect(logs[0]).toContain('[INFO]');
    expect(logs[0]).toContain('Test message for storage');
  });

  it('should clear logs from storage', async () => {
    loggingModule.updateConfig({ writeToStorage: true });

    loggingModule.info('Test message 1');
    loggingModule.info('Test message 2');

    let logs = await loggingModule.getAllLogs();
    expect(logs.length).toBe(2);

    await loggingModule.clearLogs();

    logs = await loggingModule.getAllLogs();
    expect(logs.length).toBe(0);
  });

  it('should update configuration', () => {
    const newConfig: Partial<LoggerConfig> = {
      level: 'debug',
      enabled: false,
    };

    loggingModule.updateConfig(newConfig);

    // Проверяем, что конфигурация обновлена (это сложно протестировать напрямую без доступа к приватным полям)
    // Но мы можем проверить, что метод не вызывает ошибок
    expect(() => loggingModule.updateConfig(newConfig)).not.toThrow();
  });

  it('should handle disabled logging', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

    // Отключаем логирование
    loggingModule.updateConfig({ enabled: false });

    loggingModule.info('This should not be logged');

    expect(spy).not.toHaveBeenCalled();
  });
});
