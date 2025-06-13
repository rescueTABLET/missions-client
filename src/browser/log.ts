import { type Logger } from "../log.js";

export const browserLogger: Logger = {
  verbose: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
};
