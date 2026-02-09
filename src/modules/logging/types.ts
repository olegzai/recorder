// Интерфейс для системы логирования
export interface ILogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  trace(message: string, ...args: any[]): void;
  fatal(message: string, ...args: any[]): void;
}

// Конфигурация логирования
export interface LoggerConfig {
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  enabled?: boolean;
  writeToConsole?: boolean;
  writeToStorage?: boolean;
  maxLogSize?: number; // максимальный размер лога в байтах
  retentionDays?: number; // количество дней хранения логов
}
