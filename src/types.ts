import type { Mission, Resource, UserInfo } from "./client/types.gen.js";

export type LoadingState = { state: "loading" };
export type ReadyState<T> = { state: "ready"; data: T };
export type ErrorState = { state: "error"; error: Error };
export type DataState<T> = LoadingState | ReadyState<T> | ErrorState;

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
export type UserUpdatedEvent = { user?: UserInfo };
export type CloseEvent = {};

export type MissionsManagerEventTypes = {
  mission_added: ManagedMissionAddedEvent;
  mission_updated: ManagedMissionUpdatedEvent;
  mission_removed: ManagedMissionRemovedEvent;
  user_updated: UserUpdatedEvent;
  close: CloseEvent;
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

export type CollectionSnapshot<T> = {
  documents: ReadonlyArray<Required<DocumentSnapshot<T>>>;
};

export type CollectionSnapshotListener<T> = {
  next: (snapshot: CollectionSnapshot<T>) => void;
  error: (error: Error) => void;
};

export type FirebaseUser = { uid: string };

export type IFirebase = {
  onDocumentSnapshot<T>(
    ref: string,
    listener: DocumentSnapshotListener<T>
  ): Promise<Unsubscribe>;

  onCollectionSnapshot<T>(
    ref: string,
    listener: CollectionSnapshotListener<T>
  ): Promise<Unsubscribe>;

  getCurrentUser(): Promise<FirebaseUser | undefined>;

  signInWithCustomToken(token: string): Promise<FirebaseUser>;

  signOut(): Promise<void>;
};
