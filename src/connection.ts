import type { UserInfo } from "./client/types.gen.js";
import { EventEmitter } from "./events.js";
import { type Logger } from "./log.js";
import { type MissionsApi } from "./missions-api.js";
import type { FirebaseUser, IFirebase, Unsubscribe } from "./types.js";

export type ConnectionEvent = {
  manager: ConnectionManager;
};

export type ConnectionAuthorizedEvent = ConnectionEvent & Connection;

export type ConnectionDeauthorizedEvent = ConnectionEvent;

export type ConnectionManagerEventTypes = {
  authorized: ConnectionAuthorizedEvent;
  deauthorized: ConnectionDeauthorizedEvent;
};

export type ConnectionManagerOptions = {
  firebase: IFirebase;
  missionsApi: MissionsApi;
  logger?: Logger;
};

export type Connection = {
  user: UserInfo;
};

export class ConnectionManager extends EventEmitter<ConnectionManagerEventTypes> {
  readonly #firebase: IFirebase;
  readonly #missionsApi: MissionsApi;
  readonly #logger?: Logger;
  #firebaseUser?: FirebaseUser;
  #missionsApiKey?: string;

  get missionsApiKey(): string | undefined {
    return this.#missionsApiKey;
  }

  constructor(options: ConnectionManagerOptions) {
    super();
    this.#firebase = options.firebase;
    this.#missionsApi = options.missionsApi;
    this.#logger = options.logger;
  }

  async authorize(missionsApiKey: string): Promise<Connection> {
    if (!this.#firebaseUser) {
      this.#firebaseUser = await this.#getFirebaseAuthorization();

      if (this.#firebaseUser) {
        this.#logger?.info(
          `[connection] Firebase is initially authorized as user '${this.#firebaseUser.uid}'.`
        );
      } else {
        this.#logger?.info("[connection] Firebase is initially deauthorized.");
      }
    }

    this.#logger?.info(
      `[connection] Connecting with Missions API key '${missionsApiKey}'…`
    );

    try {
      const [user, { token }] = await Promise.all([
        this.#missionsApi.getUser({ apiKey: missionsApiKey }),
        this.#missionsApi.getFirebaseConfig({ apiKey: missionsApiKey }),
      ]);

      this.#logger?.verbose(
        `[connection] Loaded user info from Missions API: ${JSON.stringify(user)}`
      );

      if (this.#firebaseUser?.uid === user.id) {
        this.#logger?.info(
          `[connection] Newly authorized user '${user.id}' is identical to currently authorized user.`
        );
      } else {
        if (this.#firebaseUser) {
          this.#logger?.info(
            `[connection] Newly authorized user '${user.id}' is different from currently authorized user '${this.#firebaseUser.uid}', re-authorizing Firebase…`
          );
        } else {
          this.#logger?.info(
            `[connection] Authorizing Firebase with user '${user.id}'…`
          );
        }

        this.#firebaseUser = await this.#firebase.signInWithCustomToken(token);
      }

      this.#missionsApiKey = missionsApiKey;
      this.emit("authorized", { manager: this, user });
      return { user };
    } catch (error: unknown) {
      this.#logger?.warn(
        `[connection] Error authorizing with Missions API key '${missionsApiKey}':`,
        error
      );
      this.#missionsApiKey = undefined;
      await this.deauthorize();
      throw error;
    }
  }

  async deauthorize() {
    if (!this.#firebaseUser) return;
    this.#logger?.info("[connection] Deauthorizing…");

    try {
      await this.#firebase.signOut();
    } catch (error: unknown) {
      this.#logger?.warn("[connection] Error signing out of Firebase:", error);
    }

    this.#firebaseUser = undefined;
    this.emit("deauthorized", { manager: this });
  }

  #getFirebaseAuthorization(): Promise<FirebaseUser | undefined> {
    let unsubscribe: Unsubscribe | undefined;

    return new Promise<FirebaseUser | undefined>((resolve) => {
      this.#firebase.onAuthStateChanged(resolve).then((s) => (unsubscribe = s));
    }).finally(() => {
      unsubscribe?.();
    });
  }
}
