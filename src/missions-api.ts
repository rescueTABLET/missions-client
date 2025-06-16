import { type Client, type Config, createClient } from "@hey-api/client-fetch";
import { getFirebaseConfig, getUser } from "./client/sdk.gen.js";
import type { FirebaseConfig, UserInfo } from "./client/types.gen.js";
import { type Logger } from "./log.js";

export type MissionsApiCallArgs = {
  apiKey?: string;
};

export type MissionsApi = {
  getClient(args?: MissionsApiCallArgs): Client;
  getUser(args?: MissionsApiCallArgs): Promise<UserInfo>;
  getFirebaseConfig(args?: MissionsApiCallArgs): Promise<FirebaseConfig>;
};

export type RemoteMissionsApiOptions = {
  baseUrl?: string;
  userAgent?: string;
  cache?: Cache;
  logger?: Logger;
};

export class RemoteMissionsApi implements MissionsApi {
  readonly #cache?: Cache;
  readonly #logger?: Logger;
  readonly #clientConfig: Config;

  constructor(options: RemoteMissionsApiOptions = {}) {
    this.#cache = options.cache;
    this.#logger = options.logger;
    this.#clientConfig = {
      baseUrl: options.baseUrl ?? "https://missions-api.rescuetablet.com",
      headers: {
        ...(options.userAgent ? { "user-agent": options.userAgent } : {}),
      },
    };
  }

  async getUser(args?: MissionsApiCallArgs): Promise<UserInfo> {
    return this.#loadCached(args, "user", async () => {
      const { data } = await getUser({
        client: this.getClient(args),
        throwOnError: true,
      });
      return data;
    });
  }

  async getFirebaseConfig(args?: MissionsApiCallArgs): Promise<FirebaseConfig> {
    return this.#loadCached(args, "firebase-config", async () => {
      const { data } = await getFirebaseConfig({
        client: this.getClient(args),
        throwOnError: true,
      });
      return data;
    });
  }

  getClient(args: MissionsApiCallArgs = {}) {
    return createClient({
      ...this.#clientConfig,
      auth: args.apiKey,
    });
  }

  async #loadCached<T>(
    args: MissionsApiCallArgs | undefined,
    keySuffix: string,
    loadRemote: () => Promise<T>
  ): Promise<T> {
    const key = [args?.apiKey ?? "default", keySuffix].join(":");

    try {
      const value = await loadRemote();
      this.#logger?.verbose(`Loaded data from missions API ${key}`);
      this.#cache?.setItem(key, JSON.stringify(value));
      return value;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 401
      ) {
        throw new Error("Invalid Missions API Key");
      }

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
