import { type Config } from "./client/client/types.gen.js";
import { type UserInfo } from "./client/types.gen.js";
import {
  ConnectionManager,
  type ConnectionAuthorizedEvent,
} from "./connection.js";
import { EventEmitter } from "./events.js";
import { type FirestoreUser } from "./firestore.js";
import { type Logger } from "./log.js";
import { MissionManager } from "./MissionManager.js";
import { RemoteMissionsApi, type MissionsApi } from "./missions-api.js";
import { onSnapshotWithBackoff } from "./onSnapshotWithBackoff.js";
import type {
  IFirebase,
  ManagedMission,
  ManagedMissionRemovedEvent,
  ManagedMissionUpdatedEvent,
  MissionsManagerEventTypes,
} from "./types.js";

export type MissionsManagerOptions = {
  firebase: IFirebase;
  missionsApi?: MissionsApi;
  logger?: Logger;
};

export class MissionsManager extends EventEmitter<MissionsManagerEventTypes> {
  readonly #missionsApi: MissionsApi;
  readonly #connections: ConnectionManager;
  readonly #logger?: Logger;
  #userSubscription?: () => void;

  readonly #firebase: IFirebase;
  get firebase(): IFirebase {
    return this.#firebase;
  }

  #user?: UserInfo;
  get user(): UserInfo | undefined {
    return this.#user;
  }

  readonly #missions = new Map<string, MissionManager>();
  get missions(): ReadonlyMap<string, ManagedMission> {
    return new Map(
      [...this.#missions.values()].map((manager) => [
        manager.missionId,
        manager.mission,
      ])
    );
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

    const manager = new MissionManager({
      missionId,
      firebase: this.#firebase,
      logger: this.#logger,
    });

    this.#missions.set(missionId, manager);
    this.emit("mission_added", { id: missionId, state: "loading" });

    const missionUpdatedListener = (event: ManagedMissionUpdatedEvent) =>
      this.emit("mission_updated", event);
    manager.on("mission_updated", missionUpdatedListener);

    const missionRemovedListener = (event: ManagedMissionRemovedEvent) => {
      this.#missions.delete(missionId);
      manager.off("mission_updated", missionUpdatedListener);
      manager.off("mission_removed", missionRemovedListener);
      this.emit("mission_removed", event);
    };

    manager.on("mission_removed", missionRemovedListener);
  }

  #unsubscribe(missionId: string) {
    this.#logger?.info(`[manager] Unsubscribing from mission ${missionId}…`);
    this.#missions.get(missionId)?.close();
  }

  async close() {
    this.#logger?.info("[manager] Closing…");

    this.#missions.forEach((mission) => mission.close());

    this.#connections.off("authorized", this.#authorizedListener);
    this.#connections.off("deauthorized", this.#deauthorize);
    await this.#deauthorize();

    this.emit("close", {});
    super.close();
  }
}
