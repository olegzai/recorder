// Logging module for the application

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: unknown;
}

class LoggerModule {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private loggers: { [key: string]: Logger } = {};

  constructor(maxLogs = 1000) {
    this.maxLogs = maxLogs;
  }

  log(level: LogLevel, message: string, context?: unknown): void {
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also output to console
    this.outputToConsole(logEntry);
  }

  debug(message: string, context?: unknown): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: unknown): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: unknown): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: unknown): void {
    this.log(LogLevel.ERROR, message, context);
  }

  getLogs(): LogEntry[] {
    return [...this.logs]; // Return a copy
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return this.logs
      .map(
        (entry) =>
          `[${new Date(entry.timestamp).toISOString()}] [${entry.level.toUpperCase()}] ${entry.message}` +
          (entry.context ? ` - Context: ${JSON.stringify(entry.context)}` : ''),
      )
      .join('\n');
  }

  createLogger(name: string): Logger {
    if (!this.loggers[name]) {
      this.loggers[name] = new Logger(name, this);
    }
    return this.loggers[name];
  }

  private outputToConsole(entry: LogEntry): void {
    const formattedMessage = `[${new Date(entry.timestamp).toLocaleString()}] ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`[DEBUG] ${formattedMessage}`, entry.context);
        break;
      case LogLevel.INFO:
        console.info(`[INFO] ${formattedMessage}`, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(`[WARN] ${formattedMessage}`, entry.context);
        break;
      case LogLevel.ERROR:
        console.error(`[ERROR] ${formattedMessage}`, entry.context);
        break;
    }
  }
}

export class Logger {
  constructor(
    private name: string,
    private loggerModule: LoggerModule,
  ) {}

  debug(message: string, context?: unknown): void {
    this.loggerModule.log(LogLevel.DEBUG, `[${this.name}] ${message}`, context);
  }

  info(message: string, context?: unknown): void {
    this.loggerModule.log(LogLevel.INFO, `[${this.name}] ${message}`, context);
  }

  warn(message: string, context?: unknown): void {
    this.loggerModule.log(LogLevel.WARN, `[${this.name}] ${message}`, context);
  }

  error(message: string, context?: unknown): void {
    this.loggerModule.log(LogLevel.ERROR, `[${this.name}] ${message}`, context);
  }
}

// Global logger instance
export const loggerModule = new LoggerModule();

// Create specific loggers for different parts of the application
export const appLogger = loggerModule.createLogger('App');
export const audioLogger = loggerModule.createLogger('Audio');
export const storageLogger = loggerModule.createLogger('Storage');
export const recordingLogger = loggerModule.createLogger('Recording');
