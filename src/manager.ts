import { type Config } from "./client/client/types.js";
import { type UserInfo } from "./client/types.gen.js";
import {
  ConnectionManager,
  type ConnectionAuthorizedEvent,
} from "./connection.js";
import { EventEmitter } from "./events.js";
import {
  fromFirestoreMission,
  type FirestoreMission,
  type FirestoreUser,
} from "./firestore.js";
import { type Logger } from "./log.js";
import { RemoteMissionsApi, type MissionsApi } from "./missions-api.js";
import { onSnapshotWithBackoff } from "./onSnapshotWithBackoff.js";
import type {
  IFirebase,
  ManagedMission,
  MissionsManagerEventTypes,
  RemoteMission,
} from "./types.js";

export type MissionsManagerOptions = {
  firebase: IFirebase;
  missionsApi?: MissionsApi;
  logger?: Logger;
};

export class MissionsManager extends EventEmitter<MissionsManagerEventTypes> {
  readonly missions = new Map<string, ManagedMission>();
  readonly #missionsApi: MissionsApi;
  readonly #connections: ConnectionManager;
  readonly #logger?: Logger;
  readonly #subscriptions = new Map<string, () => void>();
  #userSubscription?: () => void;

  readonly #firebase: IFirebase;
  get firebase(): IFirebase {
    return this.#firebase;
  }

  #user?: UserInfo;
  get user(): UserInfo | undefined {
    return this.#user;
  }

  constructor(options: MissionsManagerOptions) {
    super();
    this.#logger = options.logger;
    this.#firebase = options.firebase;
    this.#missionsApi = options.missionsApi ?? new RemoteMissionsApi();

    this.#connections = new ConnectionManager({
      firebase: this.#firebase,
      missionsApi: this.#missionsApi,
      logger: this.#logger,
    });
    this.#connections.on("authorized", this.#authorizedListener.bind(this));
    this.#connections.on("deauthorized", this.#deauthorize.bind(this));
  }

  getClientOptions(): Pick<Config, "baseUrl" | "headers" | "auth"> {
    return this.#missionsApi.getClientOptions({
      apiKey: this.#connections.missionsApiKey,
    });
  }

  async authorize(missionsApiKey: string): Promise<void> {
    await this.#connections.authorize(missionsApiKey);
  }

  async deauthorize(): Promise<void> {
    await this.#connections.deauthorize();
  }

  async #authorizedListener(event: ConnectionAuthorizedEvent) {
    await this.#deauthorize();

    const userId = event.user.id;
    this.#logger?.info(`[manager] Subscribing to user ${userId}…`);

    this.#userSubscription = await onSnapshotWithBackoff<FirestoreUser>(
      this.#firebase,
      `users/${userId}`,
      (snapshot) => {
        if (snapshot.data) {
          const user = this.#toUser(userId, snapshot.data);
          this.#user = user;
          this.emit("user_updated", { user });

          const missionIds = Object.keys(snapshot.data.missions ?? {});
          this.#logger?.verbose(
            `[manager] Updated mission IDs for user ${userId} (${missionIds.length}): ${missionIds.join(", ")}`
          );
          this.#setMissionIds(missionIds);
        }
      }
    );
  }

  async #deauthorize() {
    if (!this.#user && !this.#userSubscription) return;

    this.#logger?.info("[manager] Deauthorizing…");

    this.#user = undefined;
    this.#userSubscription?.();
    this.#userSubscription = undefined;
    this.emit("user_updated", {});
    this.#setMissionIds([]);
  }

  #toUser(id: string, data: FirestoreUser): UserInfo {
    return {
      id,
      email: data.email,
      displayName: data.displayName,
      defaultMissionGroups: [...(data.defaultMissionGroups ?? [])],
      roles: [...(data.roles ?? [])],
      permissions: Object.entries(data.permissions ?? {})
        .filter(([, value]) => value)
        .map(([key]) => key),
      groups: Object.entries(data.groupPermissions ?? {}).map(
        ([groupId, group]) => ({
          groupId,
          permissions: Object.entries(group)
            .filter(([, value]) => value)
            .map(([key]) => key),
          defaultGroup: data.defaultMissionGroups?.includes(groupId) ?? false,
          ...data.groups?.[groupId],
        })
      ),
    };
  }

  #setMissionIds(missionIds: ReadonlyArray<string>) {
    const newMissionIds = missionIds.filter(
      (missionId) => !this.missions.has(missionId)
    );

    if (newMissionIds.length) {
      this.#logger?.info(
        `[manager] Subscribing to ${newMissionIds.length} missions: ${newMissionIds.join(", ")}…`
      );

      for (const missionId of newMissionIds) {
        this.#subscribe(missionId);
      }
    }

    const removedMissionIds = [...this.missions.keys()].filter(
      (missionId) => !missionIds.includes(missionId)
    );

    if (removedMissionIds.length) {
      this.#logger?.info(
        `[manager] Unsubscribing from ${removedMissionIds.length} missions: ${removedMissionIds.join(", ")}…`
      );

      for (const missionId of removedMissionIds) {
        this.#unsubscribe(missionId);
      }
    }
  }

  #subscribe(missionId: string) {
    this.#logger?.info(`[manager] Subscribing to mission ${missionId}…`);
    this.missions.set(missionId, { id: missionId, state: "loading" });
    this.emit("mission_added", { id: missionId, state: "loading" });

    onSnapshotWithBackoff<FirestoreMission>(
      this.#firebase,
      `missions/${missionId}`,
      (snapshot) => {
        if (snapshot.data) {
          this.#updateMission(missionId, snapshot.data);
        } else {
          this.#logger?.warn(`[manager] Mission not found: ${missionId}`);
          this.#unsubscribe(missionId, true);
        }
      },
      {
        logger: this.#logger,
        maxDelay: 30000,
      }
    )
      .then((unsubscribe) => {
        this.#subscriptions.set(missionId, unsubscribe);
      })
      .catch((error) => {
        this.#unsubscribe(missionId, true);
        this.missions.set(missionId, { id: missionId, state: "error", error });
      });
  }

  #updateMission(missionId: string, snapshot: FirestoreMission) {
    const mission: RemoteMission = fromFirestoreMission(missionId, snapshot);

    const value: ManagedMission = {
      id: missionId,
      state: "ready",
      mission,
    };

    this.missions.set(missionId, value);
    this.emit("mission_updated", value);
  }

  #unsubscribe(missionId: string, skipDelete?: boolean) {
    this.#logger?.info(`[manager] Unsubscribing from mission ${missionId}…`);
    this.#subscriptions.get(missionId)?.();
    this.#subscriptions.delete(missionId);

    if (!skipDelete) {
      this.missions.delete(missionId);
      this.emit("mission_removed", { id: missionId });
    }
  }

  async close() {
    this.#logger?.info("[manager] Closing…");

    this.#connections.off("authorized", this.#authorizedListener);
    this.#connections.off("deauthorized", this.#deauthorize);
    await this.#deauthorize();

    this.emit("close", {});
    super.close();
  }
}
