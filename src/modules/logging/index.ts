import logger from './logger';
import type { ILogger, LoggerConfig } from './types';

class LoggingModule implements ILogger {
  private config: LoggerConfig;
  private isEnabled: boolean = true;

  constructor(config?: LoggerConfig) {
    this.config = {
      level: 'info',
      enabled: true,
      writeToConsole: true,
      writeToStorage: false,
      maxLogSize: 1024 * 1024, // 1MB
      retentionDays: 7,
      ...config,
    };

    this.isEnabled = this.config.enabled ?? true;
  }

  /**
   * Инициализирует модуль логирования
   */
  async initialize(): Promise<void> {
    logger.info('Logging module initialized');
  }

  /**
   * Записывает информационное сообщение
   */
  info(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    if (this.config.writeToConsole) {
      logger.info(message, ...args);
    }
    if (this.config.writeToStorage) {
      this.saveToStorage('info', message, args);
    }
  }

  /**
   * Записывает предупреждение
   */
  warn(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    if (this.config.writeToConsole) {
      logger.warn(message, ...args);
    }
    if (this.config.writeToStorage) {
      this.saveToStorage('warn', message, args);
    }
  }

  /**
   * Записывает ошибку
   */
  error(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    if (this.config.writeToConsole) {
      logger.error(message, ...args);
    }
    if (this.config.writeToStorage) {
      this.saveToStorage('error', message, args);
    }
  }

  /**
   * Записывает отладочное сообщение
   */
  debug(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    if (this.config.writeToConsole) {
      logger.debug(message, ...args);
    }
    if (this.config.writeToStorage) {
      this.saveToStorage('debug', message, args);
    }
  }

  /**
   * Записывает трассировочное сообщение
   */
  trace(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    if (this.config.writeToConsole) {
      logger.trace(message, ...args);
    }
    if (this.config.writeToStorage) {
      this.saveToStorage('trace', message, args);
    }
  }

  /**
   * Записывает фатальное сообщение об ошибке
   */
  fatal(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    if (this.config.writeToConsole) {
      logger.fatal(message, ...args);
    }
    if (this.config.writeToStorage) {
      this.saveToStorage('fatal', message, args);
    }
  }

  /**
   * Получает все логи из хранилища
   */
  async getAllLogs(): Promise<string[]> {
    if (!this.config.writeToStorage) {
      return [];
    }

    const logsStr = localStorage.getItem('app-logs');
    return logsStr ? JSON.parse(logsStr) : [];
  }

  /**
   * Очищает логи из хранилища
   */
  async clearLogs(): Promise<void> {
    if (this.config.writeToStorage) {
      localStorage.removeItem('app-logs');
    }
  }

  /**
   * Экспортирует логи в файл
   */
  async exportLogs(
    filename: string = `logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`,
  ): Promise<void> {
    const logs = await this.getAllLogs();
    const content = logs.join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Сохраняет лог в хранилище
   */
  private saveToStorage(level: string, message: string, args: any[]): void {
    if (!this.config.writeToStorage) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(args)}`;

    try {
      let logs: string[] = [];
      const logsStr = localStorage.getItem('app-logs');

      if (logsStr) {
        logs = JSON.parse(logsStr);

        // Ограничиваем размер логов
        if (this.config.maxLogSize) {
          let totalSize = logs.reduce((acc, log) => acc + log.length, 0);

          // Удаляем старые логи, если превышен максимальный размер
          while (totalSize > this.config.maxLogSize && logs.length > 0) {
            const removedLog = logs.shift();
            if (removedLog) {
              totalSize -= removedLog.length;
            }
          }
        }
      }

      logs.push(logEntry);
      localStorage.setItem('app-logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save log to storage:', error);
    }
  }

  /**
   * Изменяет конфигурацию логирования
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.isEnabled = this.config.enabled ?? true;

    // Обновляем уровень логирования в pino
    if (this.config.level) {
      logger.level = this.config.level;
    }
  }
}

// Экземпляр модуля логирования
export const loggingModule = new LoggingModule();

// Инициализируем модуль при загрузке
loggingModule.initialize().catch((error) => {
  console.error('Failed to initialize logging module:', error);
});
