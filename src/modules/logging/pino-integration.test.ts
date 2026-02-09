import pino from 'pino';
import { describe, expect, it } from 'vitest';
import { loggingModule } from './index';

// Простой тест для проверки интеграции pino
describe('Pino Integration', () => {
  it('should create a pino logger instance', () => {
    // Проверяем, что pino может быть импортирован и использован
    const logger = pino({
      level: 'silent', // Не выводим логи во время теста
      browser: {},
    });

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });

  it('should have loggingModule available', () => {
    expect(loggingModule).toBeDefined();
    expect(typeof loggingModule.info).toBe('function');
    expect(typeof loggingModule.error).toBe('function');
    expect(typeof loggingModule.warn).toBe('function');
    expect(typeof loggingModule.debug).toBe('function');
  });

  it('should allow updating configuration', () => {
    const initialLevel = loggingModule['config'].level;

    loggingModule.updateConfig({ level: 'debug' });

    expect(loggingModule['config'].level).toBe('debug');

    // Восстанавливаем исходное значение
    loggingModule.updateConfig({ level: initialLevel });
  });
});
