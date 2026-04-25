const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logDir = 'logs') {
    this.logDir = logDir;
    this.errorLogFile = path.join(logDir, 'errors.log');
    this.generalLogFile = path.join(logDir, 'general.log');
    
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  log(message) {
    const timestamp = this.formatTimestamp();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.generalLogFile, logMessage);
      console.log(logMessage.trim());
    } catch (error) {
      console.error(`Erro ao escrever log: ${error.message}`);
    }
  }

  error(message, exception = null) {
    const timestamp = this.formatTimestamp();
    let errorMessage = `[${timestamp}] ERRO: ${message}`;
    
    if (exception) {
      errorMessage += `\nDetalhes: ${exception.stack || exception.message}`;
    }
    
    errorMessage += '\n';
    
    try {
      fs.appendFileSync(this.errorLogFile, errorMessage);
      fs.appendFileSync(this.generalLogFile, errorMessage);
      console.error(errorMessage.trim());
    } catch (err) {
      console.error(`Erro ao escrever log de erro: ${err.message}`);
    }
  }

  warn(message) {
    const timestamp = this.formatTimestamp();
    const warnMessage = `[${timestamp}] AVISO: ${message}\n`;
    
    try {
      fs.appendFileSync(this.generalLogFile, warnMessage);
      console.warn(warnMessage.trim());
    } catch (error) {
      console.error(`Erro ao escrever aviso: ${error.message}`);
    }
  }
}

module.exports = Logger;
