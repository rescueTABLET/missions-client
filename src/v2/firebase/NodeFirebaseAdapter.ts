import { Auth } from "firebase/auth";
import { NodeAuth } from "./NodeAuth.js";
import { type FirestoreEmitter, NodeFirestore } from "./NodeFirestore.js";
import type {
  CollectionSnapshotListener,
  DocumentSnapshotListener,
  FirebaseAdapter,
  FirebaseUser,
} from "./types.js";

export class NodeFirebaseAdapter implements FirebaseAdapter {
  readonly #firestore: NodeFirestore;
  readonly #auth: NodeAuth;

  constructor({
    firestore,
    auth,
  }: {
    readonly firestore: NodeFirestore;
    readonly auth: NodeAuth;
  }) {
    this.#firestore = firestore;
    this.#auth = auth;
  }

  static create({
    firestore,
    auth,
  }: {
    readonly firestore: NodeFirestore;
    readonly auth: Auth;
  }): NodeFirebaseAdapter {
    return new NodeFirebaseAdapter({
      firestore,
      auth: NodeAuth.create(auth),
    });
  }

  static createNull({
    firestore,
  }: {
    readonly firestore?: { readonly emitter?: FirestoreEmitter };
  } = {}): NodeFirebaseAdapter {
    return new NodeFirebaseAdapter({
      firestore: NodeFirestore.createNull(firestore),
      auth: NodeAuth.createNull(),
    });
  }

  async onDocumentSnapshot<T>(
    ref: string,
    { next, error }: DocumentSnapshotListener<T>
  ) {
    return this.#firestore.onDocumentSnapshot(ref, {
      next: (snapshot) =>
        next({ id: snapshot.id, data: snapshot.data() as T | undefined }),
      error,
    });
  }

  async onCollectionSnapshot<T>(
    ref: string,
    { next, error }: CollectionSnapshotListener<T>
  ) {
    return this.#firestore.onCollectionSnapshot(ref, {
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

  async getCurrentUser(): Promise<FirebaseUser | undefined> {
    return this.#auth.getCurrentUser();
  }

  async signInWithCustomToken(token: string): Promise<FirebaseUser> {
    return this.#auth.signInWithCustomToken(token);
  }

  async signOut() {
    await this.#auth.signOut();
  }
}
