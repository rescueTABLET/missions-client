import { createClient, type Client } from "@hey-api/client-fetch";
import { getFirebaseConfig, getUser } from "./client/sdk.gen.js";
import type { FirebaseConfig, UserInfo } from "./client/types.gen.js";
import { type Logger } from "./log.js";

export type MissionsApi = {
  readonly client: Client;
  getUser(): Promise<UserInfo>;
  getFirebaseConfig(): Promise<FirebaseConfig>;
};

export type RemoteMissionsApiOptions = {
  apiKey: string;
  baseUrl?: string;
  userAgent?: string;
  cache?: Cache;
  logger?: Logger;
};

export class RemoteMissionsApi implements MissionsApi {
  readonly client: Client;
  readonly #keyPrefix: string;
  readonly #cache?: Cache;
  readonly #logger?: Logger;

  constructor(options: RemoteMissionsApiOptions) {
    this.client = createClient({
      baseUrl: options.baseUrl ?? "https://missions-api.rescuetablet.com",
      headers: {
        authorization: options.apiKey,
        ...(options.userAgent ? { "user-agent": options.userAgent } : {}),
      },
    });
    this.#keyPrefix = `${options.apiKey}:`;
    this.#cache = options.cache;
    this.#logger = options.logger;
  }

  async getUser(): Promise<UserInfo> {
    return this.#loadCached(`${this.#keyPrefix}user`, async () => {
      const { data } = await getUser({
        client: this.client,
        throwOnError: true,
      });
      return data;
    });
  }

  async getFirebaseConfig(): Promise<FirebaseConfig> {
    return this.#loadCached(`${this.#keyPrefix}firebase-config`, async () => {
      const { data } = await getFirebaseConfig({
        client: this.client,
        throwOnError: true,
      });
      return data;
    });
  }

  async #loadCached<T>(key: string, loadRemote: () => Promise<T>): Promise<T> {
    try {
      const value = await loadRemote();
      this.#logger?.verbose(`Loaded data from missions API ${key}`);
      this.#cache?.setItem(key, JSON.stringify(value));
      return value;
    } catch (error: unknown) {
      this.#logger?.warn(
        `Error loading data from missions API ${key}: ${error}`
      );
    }

    try {
      const stored = await this.#cache?.getItem(key);

      if (typeof stored === "string") {
        const value = JSON.parse(stored);
        this.#logger?.verbose(`Returning cached value ${key}`);
        return value;
      }
    } catch (error: unknown) {
      throw new Error(`Error loading cached value ${key}: ${error}`, {
        cause: error,
      });
    }

    throw new Error(
      `Could not load data from missions API and no value found in cache. ${key}`
    );
  }
}

export type Cache = {
  getItem(key: string): Promise<string | undefined>;
  setItem(key: string, value: string): Promise<void>;
};

export class LocalStorageCache implements Cache {
  readonly #localStorageKeyPrefix: string;

  constructor(
    localStorageKeyPrefix = "rescuetablet:missions-client:missions-api:"
  ) {
    this.#localStorageKeyPrefix = localStorageKeyPrefix;
  }

  async getItem(key: string): Promise<string | undefined> {
    return (
      localStorage.getItem(`${this.#localStorageKeyPrefix}${key}`) ?? undefined
    );
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(`${this.#localStorageKeyPrefix}${key}`, value);
  }
}
