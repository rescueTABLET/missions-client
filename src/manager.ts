import { fromFirebaseMission, type FirebaseMissionData } from "./firestore";
import { type Logger } from "./log";
import { onSnapshotWithBackoff } from "./onSnapshotWithBackoff";
import type {
  IFirestore,
  ManagedMission,
  MissionsManagerEventListener,
  MissionsManagerEventTypes,
  RemoteMission,
} from "./types";

type Subscription = { unsubscribe(): void };

export type MissionsManagerOptions = {
  firestore: IFirestore;
  logger?: Logger;
};

export class MissionsManager {
  readonly missions = new Map<string, ManagedMission>();

  private readonly firestore: IFirestore;
  private readonly logger?: Logger;
  private readonly subscriptions = new Map<string, Subscription>();
  private readonly listeners = new Map<
    string,
    Set<MissionsManagerEventListener<any>>
  >();

  constructor(options: MissionsManagerOptions) {
    this.firestore = options.firestore;
    this.logger = options.logger;
  }

  setMissionIds(missionIds: ReadonlyArray<string>) {
    const newMissionIds = missionIds.filter(
      (missionId) => !this.missions.has(missionId)
    );

    if (newMissionIds.length) {
      this.logger?.info(
        `Subscribing to ${newMissionIds.length} missions: ${newMissionIds.join(", ")}…`
      );

      for (const missionId of newMissionIds) {
        this.subscribe(missionId);
      }
    }

    const removedMissionIds = [...this.missions.keys()].filter(
      (missionId) => !missionIds.includes(missionId)
    );

    if (removedMissionIds.length) {
      this.logger?.info(
        `Unsubscribing from ${removedMissionIds.length} missions: ${removedMissionIds.join(", ")}…`
      );

      for (const missionId of removedMissionIds) {
        this.unsubscribe(missionId);
      }
    }
  }

  private subscribe(missionId: string) {
    this.logger?.info(`Subscribing to mission ${missionId}…`);
    this.missions.set(missionId, { id: missionId, state: "loading" });
    this.emit("mission_added", { id: missionId, state: "loading" });

    onSnapshotWithBackoff<FirebaseMissionData>(
      this.firestore,
      `missions/${missionId}`,
      (snapshot) => {
        if (snapshot.data) {
          this.updateMission(missionId, snapshot.data);
        } else {
          this.logger?.warn(`Mission not found: ${missionId}`);
          this.unsubscribe(missionId, true);
        }
      },
      {
        logger: this.logger,
        maxDelay: 30000,
      }
    )
      .then((unsubscribe) => {
        this.subscriptions.set(missionId, { unsubscribe });
      })
      .catch((error) => {
        this.unsubscribe(missionId, true);
        this.missions.set(missionId, { id: missionId, state: "error", error });
      });
  }

  private updateMission(missionId: string, snapshot: FirebaseMissionData) {
    const mission: RemoteMission = fromFirebaseMission(missionId, snapshot);

    const value: ManagedMission = {
      id: missionId,
      state: "ready",
      mission,
    };

    this.missions.set(missionId, value);
    this.emit("mission_updated", value);
  }

  private unsubscribe(missionId: string, skipDelete?: boolean) {
    this.logger?.info(`Unsubscribing from mission ${missionId}…`);
    const subscription = this.subscriptions.get(missionId);
    subscription?.unsubscribe();
    this.subscriptions.delete(missionId);

    if (!skipDelete) {
      this.missions.delete(missionId);
      this.emit("mission_removed", { id: missionId });
    }
  }

  close() {
    for (const missionId of this.missions.keys()) {
      this.unsubscribe(missionId);
    }
  }

  addEventListener<T extends keyof MissionsManagerEventTypes>(
    type: T,
    listener: MissionsManagerEventListener<T>
  ) {
    let listeners = this.listeners.get(type);
    if (!listeners) {
      listeners = new Set<MissionsManagerEventListener<any>>();
      this.listeners.set(type, listeners);
    }
    listeners.add(listener);
  }

  removeEventListener<T extends keyof MissionsManagerEventTypes>(
    type: T,
    listener: MissionsManagerEventListener<T>
  ) {
    let listeners = this.listeners.get(type);
    if (listeners) listeners.delete(listener);
  }

  private emit<T extends keyof MissionsManagerEventTypes>(
    type: T,
    event: MissionsManagerEventTypes[T]
  ) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }
}
