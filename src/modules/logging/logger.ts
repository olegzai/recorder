import pino from 'pino';

// Определяем уровень логирования в зависимости от среды
const getLogLevel = ():
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'fatal' => {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    return 'info';
  } else if (env === 'test') {
    return 'warn';
  }
  return 'debug';
};

// Создаем экземпляр логгера pino
const logger = pino({
  level: getLogLevel(),
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  browser: {
    transmit: {
      level: 'error',
      send: (level, logEvent) => {
        // В браузере отправляем логи на сервер или сохраняем в localStorage
        // В целях безопасности и производительности в браузерном приложении
        // можно ограничить количество отправляемых логов

        // Используем индексацию с проверкой типа для обхода ошибки TS7053
        const validMethods = ['debug', 'info', 'warn', 'error', 'log', 'trace'];
        const consoleMethod = level as string;
        if (validMethods.includes(consoleMethod)) {
          (console as any)[consoleMethod](logEvent);
        } else {
          console.log(logEvent);
        }
      },
    },
  },
});

export default logger;
