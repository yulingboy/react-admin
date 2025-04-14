import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppLoggerService extends ConsoleLogger implements LoggerService {
  private logDir: string;

  constructor() {
    super();
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  // 确保日志目录存在
  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // 将日志写入文件
  private writeLog(level: string, message: string, context?: string) {
    // 只记录 HTTP 请求日志，跳过系统启动日志
    if (context !== 'HttpRequest') {
      return;
    }

    const date = new Date();
    const logFileName = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;
    const logFilePath = path.join(this.logDir, logFileName);
    const logTime = date.toISOString();
    const logEntry = `[${logTime}] [${level}] ${message}\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error('写入日志文件失败:', err);
      }
    });
  }

  log(message: string, context?: string) {
    super.log(message, context);
    this.writeLog('INFO', `[${context || ''}] ${message}`, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    this.writeLog('ERROR', `[${context || ''}] ${message}${trace ? '\nStack: ' + trace : ''}`, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
    this.writeLog('WARN', `[${context || ''}] ${message}`, context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
    this.writeLog('DEBUG', `[${context || ''}] ${message}`, context);
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
    this.writeLog('VERBOSE', `[${context || ''}] ${message}`, context);
  }
}
