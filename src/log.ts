export type LogFn = (arg0: unknown, ...args: ReadonlyArray<unknown>) => void;

export type Logger = {
  verbose: LogFn;
  info: LogFn;
  warn: LogFn;
};
