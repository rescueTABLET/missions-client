import { EventEmitter } from "./events.js";
import { fromFirestoreMission, type FirestoreMission } from "./firestore.js";
import { type Logger } from "./log.js";
import { onSnapshotWithBackoff } from "./onSnapshotWithBackoff.js";
import type {
  CloseEvent,
  IFirebase,
  ManagedMission,
  ManagedMissionRemovedEvent,
  ManagedMissionUpdatedEvent,
  RemoteMission,
} from "./types.js";

export type MissionManagerOptions = {
  firebase: IFirebase;
  missionId: string;
  logger?: Logger;
};

export type MissionManagerEventTypes = {
  mission_updated: ManagedMissionUpdatedEvent;
  mission_removed: ManagedMissionRemovedEvent;
  close: CloseEvent;
};

export class MissionManager extends EventEmitter<MissionManagerEventTypes> {
  readonly missionId: string;
  readonly #firebase: IFirebase;
  readonly #logger?: Logger;
  readonly #subscriptions = new Map<string, () => void>();

  #mission: ManagedMission;
  get mission(): ManagedMission {
    return this.#mission;
  }

  constructor(options: MissionManagerOptions) {
    super();
    this.missionId = options.missionId;
    this.#firebase = options.firebase;
    this.#logger = options.logger;
    this.#mission = { id: options.missionId, state: "loading" };
    this.#subscribe();
  }

  #subscribe() {
    this.#logger?.info(`[manager:${this.missionId}] Subscribing…`);

    onSnapshotWithBackoff<FirestoreMission>(
      this.#firebase,
      `missions-test/${this.missionId}`,
      (snapshot) => {
        if (snapshot.data) {
          this.#updateMission(this.missionId, snapshot.data);
        } else {
          this.#logger?.warn(`[manager] Mission not found: ${this.missionId}`);
          this.#unsubscribe();
        }
      },
      {
        logger: this.#logger,
        maxDelay: 30000,
      }
    )
      .then((unsubscribe) => {
        this.#subscriptions.set("mission", unsubscribe);
      })
      .catch((error) => {
        this.#unsubscribe();
        this.#mission = { id: this.missionId, state: "error", error };
      });
  }

  #updateMission(missionId: string, snapshot: FirestoreMission) {
    const mission: RemoteMission = fromFirestoreMission(missionId, snapshot);

    const value: ManagedMission = {
      id: missionId,
      state: "ready",
      mission,
    };

    this.#mission = value;
    this.emit("mission_updated", value);
  }

  #unsubscribe() {
    this.#logger?.info(`[manager:${this.missionId}] Unsubscribing…`);
    this.#mission = { id: this.missionId, state: "loading" };

    for (const unsubscribe of this.#subscriptions.values()) {
      unsubscribe();
    }
    this.#subscriptions.clear();

    this.emit("mission_removed", { id: this.missionId });
  }

  async close() {
    this.#logger?.info("[manager] Closing…");
    this.#unsubscribe();
    this.emit("close", {});
    super.close();
  }
}
