// Simple logger for UI messages
export class Logger {
  private logElement: HTMLElement;

  constructor(logElementId: string) {
    this.logElement = document.getElementById(logElementId)!;
  }

  log(message: string, type: 'info' | 'success' | 'error' = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    this.logElement.appendChild(logEntry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  clear() {
    this.logElement.innerHTML = '';
  }
}
