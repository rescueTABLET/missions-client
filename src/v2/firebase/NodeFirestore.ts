import {
  collection,
  doc,
  onSnapshot,
  type Firestore,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import type {
  CollectionSnapshotListener,
  DocumentSnapshotListener,
} from "./types.d.js";

type DocumentReference = {
  readonly type: "document";
  readonly path: string;
};

type CollectionReference = {
  readonly type: "collection";
  readonly path: string;
};

type DocumentSnapshot = {
  readonly id: string;
  data(): unknown;
};

type CollectionSnapshot = {};

type FirestoreApi = {
  doc(path: string): DocumentReference;

  collection(path: string): CollectionReference;

  onSnapshot(
    reference: DocumentReference,
    observer: {
      next?: (snapshot: DocumentSnapshot) => void;
      error?: (error: FirestoreError) => void;
      complete?: () => void;
    }
  ): Unsubscribe;

  onSnapshot(
    reference: CollectionReference,
    observer: {
      next?: (snapshot: CollectionSnapshot) => void;
      error?: (error: FirestoreError) => void;
      complete?: () => void;
    }
  ): Unsubscribe;
};

export class NodeFirestore {
  readonly #api: FirestoreApi;

  constructor({ api }: { readonly api: FirestoreApi }) {
    this.#api = api;
  }

  static create(firestore: Firestore): NodeFirestore {
    return new NodeFirestore({
      api: {
        doc: (path) => doc(firestore, path),
        collection: (path) => collection(firestore, path),
        onSnapshot: (reference, observer) =>
          onSnapshot(reference as any, observer as any),
      },
    });
  }

  static createNull(): NodeFirestore {
    return new NodeFirestore({ api: new FirestoreApiStub() });
  }

  async onDocumentSnapshot<T>(
    ref: string,
    { next, error }: DocumentSnapshotListener<T>
  ) {
    const docRef = this.#api.doc(ref);

    return this.#api.onSnapshot(docRef, {
      next: (snapshot) =>
        next({ id: snapshot.id, data: snapshot.data() as T | undefined }),
      error,
    });
  }

  async onCollectionSnapshot<T>(
    ref: string,
    { next, error }: CollectionSnapshotListener<T>
  ) {
    const collRef = this.#api.collection(ref);

    return this.#api.onSnapshot(collRef, {
      next: (snapshot) =>
        next({
          documents: snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data() as T,
          })),
        }),
      error,
    });
  }
}

class FirestoreApiStub implements FirestoreApi {
  doc(path: string): DocumentReference {
    return { type: "document", path };
  }

  collection(path: string): CollectionReference {
    return { type: "collection", path };
  }

  onSnapshot(
    reference: DocumentReference,
    observer: {
      next?: (snapshot: DocumentSnapshot) => void;
      error?: (error: FirestoreError) => void;
      complete?: () => void;
    }
  ): Unsubscribe {
    return () => {};
  }
}
