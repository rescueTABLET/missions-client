import { EventEmitter } from "./EventEmitter";

export type Storage = {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
};

export type CacheEvents = {
  readonly itemSet: { readonly key: string; readonly value: string };
};

export const cacheEventTypes: readonly (keyof CacheEvents)[] = ["itemSet"];

export class Cache extends EventEmitter<CacheEvents> {
  readonly #storage: Storage;
  readonly #keyPrefix: string;

  constructor({
    storage,
    keyPrefix,
  }: {
    readonly storage: Storage;
    readonly keyPrefix: string;
  }) {
    super();
    this.#storage = storage;
    this.#keyPrefix = keyPrefix;
  }

  static create(): Cache {
    return new Cache({
      storage: global.localStorage,
      keyPrefix: "rescuetablet:missions-client:missions-api:",
    });
  }

  static createNull({ items }: { items?: Record<string, string> } = {}): Cache {
    return new Cache({
      storage: storageStub({ items }),
      keyPrefix: "",
    });
  }

  async getItem(key: string): Promise<string | undefined> {
    const result = await this.#storage.getItem(`${this.#keyPrefix}${key}`);
    return result ?? undefined;
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.#storage.setItem(`${this.#keyPrefix}${key}`, value);
    this.emit("itemSet", { key, value });
  }
}

function storageStub({
  items = {},
}: {
  readonly items?: Record<string, string>;
}): Storage {
  return {
    getItem: (key: string) => items[key] ?? null,
    setItem: () => {},
  };
}
