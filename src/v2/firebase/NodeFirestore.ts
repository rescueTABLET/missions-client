import {
  collection,
  doc,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { EventEmitter } from "../EventEmitter.js";

export type DocumentReference = {
  readonly type: "document";
  readonly path: string;
};

export type CollectionReference = {
  readonly type: "collection";
  readonly path: string;
};

export type Observer<T> = {
  next?: (snapshot: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
};

export type DocumentSnapshot = {
  readonly id: string;
  data(): unknown;
};

export type CollectionSnapshot = {
  readonly id: string;
  readonly docs: readonly DocumentSnapshot[];
};

type FirestoreApi = {
  doc(path: string): DocumentReference;

  collection(path: string): CollectionReference;

  onSnapshot(
    reference: DocumentReference,
    observer: {
      next?: (snapshot: DocumentSnapshot) => void;
      error?: (error: Error) => void;
      complete?: () => void;
    }
  ): Unsubscribe;

  onSnapshot(
    reference: CollectionReference,
    observer: {
      next?: (snapshot: CollectionSnapshot) => void;
      error?: (error: Error) => void;
      complete?: () => void;
    }
  ): Unsubscribe;
};

type FirestoreEmitterEventTypes = {
  documentSnapshot: {
    readonly path: string;
    readonly snapshot: DocumentSnapshot;
  };
  documentError: { readonly path: string; readonly error: Error };
  collectionSnapshot: {
    readonly path: string;
    readonly snapshot: CollectionSnapshot;
  };
  collectionError: { readonly path: string; readonly error: Error };
};

export class FirestoreEmitter extends EventEmitter<FirestoreEmitterEventTypes> {
  emitDocumentSnapshot(path: string, snapshot: DocumentSnapshot) {
    this.emit("documentSnapshot", { path, snapshot });
  }

  emitDocumentError(path: string, error: Error) {
    this.emit("documentError", { path, error });
  }

  emitCollectionSnapshot(path: string, snapshot: CollectionSnapshot) {
    this.emit("collectionSnapshot", { path, snapshot });
  }

  emitCollectionError(path: string, error: Error) {
    this.emit("collectionError", { path, error });
  }
}

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

  static createNull({
    emitter,
  }: {
    readonly emitter?: FirestoreEmitter;
  } = {}): NodeFirestore {
    return new NodeFirestore({
      api: new FirestoreApiStub({ emitter }),
    });
  }

  async onDocumentSnapshot(
    ref: string,
    { next, error }: Observer<DocumentSnapshot>
  ) {
    const docRef = this.#api.doc(ref);
    return this.#api.onSnapshot(docRef, { next, error });
  }

  async onCollectionSnapshot<T>(
    ref: string,
    { next, error }: Observer<CollectionSnapshot>
  ) {
    const collRef = this.#api.collection(ref);
    return this.#api.onSnapshot(collRef, { next, error });
  }
}

type Node = {};

type Document = Node & {
  readonly data?: unknown;
  readonly collections?: Record<string, Collection>;
};

type Collection = Node & {
  readonly documents?: Record<string, Document>;
};

class FirestoreApiStub implements FirestoreApi {
  readonly #documentObservers = new Map<
    string,
    Set<Observer<DocumentSnapshot>>
  >();
  readonly #collectionObservers = new Map<
    string,
    Set<Observer<CollectionSnapshot>>
  >();

  constructor({
    emitter,
  }: {
    readonly emitter?: FirestoreEmitter;
  } = {}) {
    if (emitter) {
      emitter.on("documentSnapshot", ({ path, snapshot }) =>
        this.emitDocumentSnapshot(path, snapshot)
      );
      emitter.on("documentError", ({ path, error }) =>
        this.emitDocumentError(path, error)
      );
      emitter.on("collectionSnapshot", ({ path, snapshot }) =>
        this.emitCollectionSnapshot(path, snapshot)
      );
      emitter.on("collectionError", ({ path, error }) =>
        this.emitCollectionError(path, error)
      );
    }
  }

  doc(path: string): DocumentReference {
    return { type: "document", path };
  }

  collection(path: string): CollectionReference {
    return { type: "collection", path };
  }

  onSnapshot(
    reference: DocumentReference | CollectionReference,
    observer: Observer<DocumentSnapshot> | Observer<CollectionSnapshot>
  ): Unsubscribe {
    return this.#addObserver(reference, observer as Observer<any>);
  }

  #addObserver<T>(
    reference: DocumentReference | CollectionReference,
    observer: Observer<T>
  ) {
    const observersMap = (
      reference.type === "document"
        ? this.#documentObservers
        : this.#collectionObservers
    ) as Map<string, Set<Observer<T>>>;

    let observers = observersMap.get(reference.path);
    if (!observers) {
      observers = new Set();
      observersMap.set(reference.path, observers);
    }
    observers.add(observer);

    return () => {
      observersMap.get(reference.path)?.delete(observer);
    };
  }

  emitDocumentSnapshot(path: string, snapshot: DocumentSnapshot) {
    const observers = this.#documentObservers.get(path);
    if (!observers) return;

    for (const observer of observers) {
      observer.next?.(snapshot);
    }
  }

  emitDocumentError(path: string, error: Error) {
    const observers = this.#documentObservers.get(path);
    if (!observers) return;

    for (const observer of observers) {
      observer.error?.(error);
    }
  }

  emitCollectionSnapshot(path: string, snapshot: CollectionSnapshot) {
    const observers = this.#collectionObservers.get(path);
    if (!observers) return;

    for (const observer of observers) {
      observer.next?.(snapshot);
    }
  }

  emitCollectionError(path: string, error: Error) {
    const observers = this.#collectionObservers.get(path);
    if (!observers) return;

    for (const observer of observers) {
      observer.error?.(error);
    }
  }
}
