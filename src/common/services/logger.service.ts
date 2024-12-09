import { Injectable, Logger, LogLevel } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  protected context: string;

  constructor(context: string = 'Application') {
    super(context);
    this.context = context;
  }

  error(message: string, trace?: string, context?: string): void {
    super.error(message, trace, context || this.context);
  }

  warn(message: string, context?: string): void {
    super.warn(message, context || this.context);
  }

  log(message: string, context?: string): void {
    super.log(message, context || this.context);
  }

  debug(message: string, context?: string): void {
    super.debug(message, context || this.context);
  }

  verbose(message: string, context?: string): void {
    super.verbose(message, context || this.context);
  }

  logWithMetadata(
    level: LogLevel,
    message: string,
    metadata: Record<string, any>,
    context?: string,
  ): void {
    const logMessage = `${message} | Metadata: ${JSON.stringify(metadata)}`;
    switch (level) {
      case 'error':
        this.error(logMessage, undefined, context);
        break;
      case 'warn':
        this.warn(logMessage, context);
        break;
      case 'log':
        this.log(logMessage, context);
        break;
      case 'debug':
        this.debug(logMessage, context);
        break;
      case 'verbose':
        this.verbose(logMessage, context);
        break;
    }
  }
} 
