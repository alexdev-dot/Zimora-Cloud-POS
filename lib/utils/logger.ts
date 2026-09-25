/**
 * Comprehensive logging utility for debugging and monitoring
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (this.isDevelopment) {
      this.consoleOutput(entry);
    }
  }

  private consoleOutput(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.context}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.error || entry.data || '');
        break;
    }
  }

  debug(context: string, message: string, data?: any): void {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: LogLevel.DEBUG,
      context,
      message,
      data,
    });
  }

  info(context: string, message: string, data?: any): void {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: LogLevel.INFO,
      context,
      message,
      data,
    });
  }

  warn(context: string, message: string, data?: any): void {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: LogLevel.WARN,
      context,
      message,
      data,
    });
  }

  error(context: string, message: string, error?: Error, data?: any): void {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: LogLevel.ERROR,
      context,
      message,
      error,
      data,
    });
  }

  getLogs(level?: LogLevel, context?: string): LogEntry[] {
    let filtered = this.logs;
    
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    
    if (context) {
      filtered = filtered.filter(log => log.context === context);
    }
    
    return filtered;
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Context-specific loggers
  product(message: string, data?: any): void {
    this.info('PRODUCT', message, data);
  }

  productError(message: string, error?: Error, data?: any): void {
    this.error('PRODUCT', message, error, data);
  }

  inventory(message: string, data?: any): void {
    this.info('INVENTORY', message, data);
  }

  inventoryError(message: string, error?: Error, data?: any): void {
    this.error('INVENTORY', message, error, data);
  }

  sale(message: string, data?: any): void {
    this.info('SALE', message, data);
  }

  saleError(message: string, error?: Error, data?: any): void {
    this.error('SALE', message, error, data);
  }

  storage(message: string, data?: any): void {
    this.info('STORAGE', message, data);
  }

  storageError(message: string, error?: Error, data?: any): void {
    this.error('STORAGE', message, error, data);
  }

  api(message: string, data?: any): void {
    this.info('API', message, data);
  }

  apiError(message: string, error?: Error, data?: any): void {
    this.error('API', message, error, data);
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience functions for direct usage
export const log = {
  debug: (context: string, message: string, data?: any) => logger.debug(context, message, data),
  info: (context: string, message: string, data?: any) => logger.info(context, message, data),
  warn: (context: string, message: string, data?: any) => logger.warn(context, message, data),
  error: (context: string, message: string, error?: Error, data?: any) => logger.error(context, message, error, data),
  
  // Context-specific
  product: (message: string, data?: any) => logger.product(message, data),
  productError: (message: string, error?: Error, data?: any) => logger.productError(message, error, data),
  inventory: (message: string, data?: any) => logger.inventory(message, data),
  inventoryError: (message: string, error?: Error, data?: any) => logger.inventoryError(message, error, data),
  sale: (message: string, data?: any) => logger.sale(message, data),
  saleError: (message: string, error?: Error, data?: any) => logger.saleError(message, error, data),
  storage: (message: string, data?: any) => logger.storage(message, data),
  storageError: (message: string, error?: Error, data?: any) => logger.storageError(message, error, data),
  api: (message: string, data?: any) => logger.api(message, data),
  apiError: (message: string, error?: Error, data?: any) => logger.apiError(message, error, data),
};