import { EventEmitter } from "./events.js";
import {
  fromFirestoreMission,
  type FirestoreMission,
  type FirestoreUser,
} from "./firestore.js";
import { type Logger } from "./log.js";
import { onSnapshotWithBackoff } from "./onSnapshotWithBackoff.js";
import type {
  IFirebase,
  ManagedMission,
  MissionsManagerEventTypes,
  RemoteMission,
} from "./types.js";

type Subscription = { unsubscribe(): void };

export type MissionsManagerOptions = {
  firebase: IFirebase;
  userId: string;
  logger?: Logger;
};

export class MissionsManager extends EventEmitter<MissionsManagerEventTypes> {
  readonly missions = new Map<string, ManagedMission>();

  readonly #userId: string;
  readonly #firebase: IFirebase;
  readonly #logger?: Logger;
  readonly #subscriptions = new Map<string, Subscription>();

  constructor(options: MissionsManagerOptions) {
    super();
    this.#userId = options.userId;
    this.#firebase = options.firebase;
    this.#logger = options.logger;
    this.#connect();
  }

  async #connect() {
    this.#logger?.info(`Subscribing to user ${this.#userId}…`);

    const unsubscribe = await onSnapshotWithBackoff<FirestoreUser>(
      this.#firebase,
      `users/${this.#userId}`,
      (snapshot) => {
        if (snapshot.data) {
          const missionIds = Object.keys(snapshot.data.missions ?? {});
          this.#logger?.verbose(
            `Updated mission IDs for user ${this.#userId}: ${missionIds.join(", ")}`
          );
          this.#setMissionIds(missionIds);
        }
      }
    );

    this.#subscriptions.set("$user", { unsubscribe });
  }

  #setMissionIds(missionIds: ReadonlyArray<string>) {
    const newMissionIds = missionIds.filter(
      (missionId) => !this.missions.has(missionId)
    );

    if (newMissionIds.length) {
      this.#logger?.info(
        `Subscribing to ${newMissionIds.length} missions: ${newMissionIds.join(", ")}…`
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
        `Unsubscribing from ${removedMissionIds.length} missions: ${removedMissionIds.join(", ")}…`
      );

      for (const missionId of removedMissionIds) {
        this.#unsubscribe(missionId);
      }
    }
  }

  #subscribe(missionId: string) {
    this.#logger?.info(`Subscribing to mission ${missionId}…`);
    this.missions.set(missionId, { id: missionId, state: "loading" });
    this.emit("mission_added", { id: missionId, state: "loading" });

    onSnapshotWithBackoff<FirestoreMission>(
      this.#firebase,
      `missions/${missionId}`,
      (snapshot) => {
        if (snapshot.data) {
          this.#updateMission(missionId, snapshot.data);
        } else {
          this.#logger?.warn(`Mission not found: ${missionId}`);
          this.#unsubscribe(missionId, true);
        }
      },
      {
        logger: this.#logger,
        maxDelay: 30000,
      }
    )
      .then((unsubscribe) => {
        this.#subscriptions.set(missionId, { unsubscribe });
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
    this.#logger?.info(`Unsubscribing from mission ${missionId}…`);
    const subscription = this.#subscriptions.get(missionId);
    subscription?.unsubscribe();
    this.#subscriptions.delete(missionId);

    if (!skipDelete) {
      this.missions.delete(missionId);
      this.emit("mission_removed", { id: missionId });
    }
  }

  close() {
    for (const missionId of this.missions.keys()) {
      this.#unsubscribe(missionId);
    }

    super.close();
  }
}
