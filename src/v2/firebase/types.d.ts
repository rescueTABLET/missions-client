export type Unsubscribe = () => void;

export type SnapshotMetadata = {
  readonly fromCache: boolean;
};

export type DocumentSnapshot<T> = {
  readonly id: string;
  readonly metadata: SnapshotMetadata;
  readonly data?: T;
};

export interface DocumentSnapshotListener<T> {
  next: (snapshot: DocumentSnapshot<T>) => void;
  error?: (error: Error) => void;
}

export type CollectionSnapshot<T> = {
  readonly metadata: SnapshotMetadata;
  readonly documents: ReadonlyArray<Required<DocumentSnapshot<T>>>;
};

export interface CollectionSnapshotListener<T> {
  next: (snapshot: CollectionSnapshot<T>) => void;
  error: (error: Error) => void;
}

export type FirebaseUser = {
  readonly uid: string;
};

export interface FirebaseAdapter {
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
}
