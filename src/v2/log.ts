export type LogFn = (arg0: unknown, ...args: ReadonlyArray<unknown>) => void;

export type Logger = {
  verbose: LogFn;
  info: LogFn;
  warn: LogFn;
};

export function consoleLogger(): Logger {
  return {
    verbose: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
  };
}
