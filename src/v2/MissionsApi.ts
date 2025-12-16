import { type Config } from "../client/client/types.gen.js";
import { getFirebaseConfig, getUser } from "../client/sdk.gen.js";
import type { FirebaseConfig, UserInfo } from "../client/types.gen.js";
import { Fetch, type StubbedRequest } from "./Fetch.js";

export class MissionsApi {
  readonly #clientOptions: Pick<
    Config,
    "baseUrl" | "headers" | "auth" | "fetch"
  >;

  constructor({
    fetch,
    baseUrl,
    userAgent,
    apiKey,
  }: {
    readonly fetch: Fetch;
    readonly baseUrl: string;
    readonly userAgent?: string;
    readonly apiKey: string;
  }) {
    this.#clientOptions = {
      baseUrl,
      auth: apiKey,
      headers: {
        ...(userAgent ? { "user-agent": userAgent } : {}),
      },
      fetch: fetch.fetch,
    };
  }

  static create({
    baseUrl = "https://missions-api.rescuetablet.com",
    userAgent,
    apiKey,
  }: {
    readonly baseUrl?: string;
    readonly userAgent?: string;
    readonly apiKey: string;
  }): MissionsApi {
    return new MissionsApi({
      fetch: Fetch.create(),
      baseUrl,
      userAgent,
      apiKey,
    });
  }

  static createNull({
    user,
    firebaseConfig,
  }: {
    readonly user?:
      | UserInfo
      | { readonly status: 401 }
      | { readonly error: true };
    readonly firebaseConfig?: FirebaseConfig;
  } = {}): MissionsApi {
    const baseUrl = `http://null`;
    const requests: StubbedRequest[] = [];

    if (user) {
      requests.push({
        request: { method: "GET", url: `${baseUrl}/user` },
        response:
          "status" in user
            ? Response.json({ status: user.status }, { status: user.status })
            : "error" in user
              ? Response.error()
              : Response.json(user),
      });
    }

    if (firebaseConfig) {
      requests.push({
        request: { method: "GET", url: `${baseUrl}/firebase-config` },
        response: Response.json(firebaseConfig),
      });
    }

    return new MissionsApi({
      baseUrl,
      apiKey: "apiKey",
      fetch: Fetch.createNull({ requests }),
    });
  }

  async getUser(): Promise<UserInfo> {
    const { data } = await getUser({
      ...this.#clientOptions,
      throwOnError: true,
    });
    return data;
  }

  async getFirebaseConfig(): Promise<FirebaseConfig> {
    const { data } = await getFirebaseConfig({
      ...this.#clientOptions,
      throwOnError: true,
    });
    return data;
  }
}
