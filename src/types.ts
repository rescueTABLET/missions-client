import { type Mission, type Resource } from "./client";

export type RemoteMission = Mission & {
  removedResources?: ReadonlyArray<Resource>;
  stale: boolean;
};

export type ManagedMission =
  | { id: string; state: "loading" }
  | { id: string; state: "ready"; mission: RemoteMission }
  | { id: string; state: "error"; error: Error };

export type ManagedMissionAddedEvent = ManagedMission;
export type ManagedMissionUpdatedEvent = ManagedMission;
export type ManagedMissionRemovedEvent = { id: string };

export type MissionsManagerEventTypes = {
  mission_added: ManagedMissionAddedEvent;
  mission_updated: ManagedMissionUpdatedEvent;
  mission_removed: ManagedMissionRemovedEvent;
};

export type MissionsManagerEventListener<
  T extends keyof MissionsManagerEventTypes,
> = (event: MissionsManagerEventTypes[T]) => void;

export type Unsubscribe = () => void;

export type DocumentSnapshot<T> = {
  id: string;
  data?: T;
};

export type DocumentSnapshotListener<T> = {
  next: (snapshot: DocumentSnapshot<T>) => void;
  error: (error: Error) => void;
};

export type IFirebase = {
  onDocumentSnapshot<T>(
    ref: string,
    listener: DocumentSnapshotListener<T>
  ): Promise<Unsubscribe>;
};
