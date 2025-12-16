import type { FirebaseConfig, UserInfo } from "../client/types.gen.js";
import { Cache } from "./Cache.js";
import { type Logger } from "./log.js";
import { MissionsApi } from "./MissionsApi.js";

export class FirebaseConfigurationProvider {
  readonly #missionsApi: MissionsApi;
  readonly #cachePrefix: string;
  readonly #cache: Cache;
  readonly #logger?: Logger;

  constructor({
    missionsApi,
    cachePrefix,
    cache,
    logger,
  }: {
    readonly missionsApi: MissionsApi;
    readonly cachePrefix: string;
    readonly cache: Cache;
    readonly logger?: Logger;
  }) {
    this.#missionsApi = missionsApi;
    this.#cachePrefix = cachePrefix;
    this.#cache = cache;
    this.#logger = logger;
  }

  static create({
    baseUrl,
    userAgent,
    apiKey,
    logger,
  }: {
    readonly baseUrl?: string;
    readonly userAgent?: string;
    readonly apiKey: string;
    readonly logger?: Logger;
  }): FirebaseConfigurationProvider {
    const missionsApi = MissionsApi.create({ baseUrl, userAgent, apiKey });

    return new FirebaseConfigurationProvider({
      missionsApi,
      cachePrefix: apiKey,
      cache: Cache.create(),
      logger,
    });
  }

  async getUser(): Promise<UserInfo> {
    return this.#loadCached("user", () => this.#missionsApi.getUser());
  }

  async getFirebaseConfig(): Promise<FirebaseConfig> {
    return this.#loadCached("firebase-config", () =>
      this.#missionsApi.getFirebaseConfig()
    );
  }

  async #loadCached<T>(keySuffix: string, load: () => Promise<T>): Promise<T> {
    const key = [this.#cachePrefix, keySuffix].join(":");
    this.#logger?.verbose(`Loading data from missions API ${key}…`);

    try {
      const value = await load();
      this.#logger?.verbose(`Loaded data from missions API ${key}`);
      this.#cache.setItem(key, JSON.stringify(value));
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
      const stored = await this.#cache.getItem(key);

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
