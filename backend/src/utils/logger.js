function formatLog(level, message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return `${timestamp} | ${level.padEnd(8)} | ArogyaMitra | ${message}`;
}

export const logger = {
  info: (msg, ...args) => console.log(formatLog('INFO', typeof msg === 'object' ? JSON.stringify(msg) : msg), ...args),
  warn: (msg, ...args) => console.warn(formatLog('WARNING', typeof msg === 'object' ? JSON.stringify(msg) : msg), ...args),
  error: (msg, ...args) => console.error(formatLog('ERROR', typeof msg === 'object' ? JSON.stringify(msg) : msg), ...args),
  debug: (msg, ...args) => console.debug(formatLog('DEBUG', typeof msg === 'object' ? JSON.stringify(msg) : msg), ...args),
};
