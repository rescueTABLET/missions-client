import { Auth, signInWithCustomToken, signOut } from "firebase/auth";
import {
  collection,
  doc,
  type Firestore,
  onSnapshot,
} from "firebase/firestore";
import { NodeAuth } from "./NodeAuth.js";
import type {
  CollectionSnapshotListener,
  DocumentSnapshotListener,
  FirebaseAdapter,
  FirebaseUser,
} from "./types.js";

export class NodeFirebaseAdapter implements FirebaseAdapter {
  readonly #firestore: Firestore;
  readonly #auth: NodeAuth;

  constructor({
    firestore,
    auth,
  }: {
    readonly firestore: Firestore;
    readonly auth: NodeAuth;
  }) {
    this.#firestore = firestore;
    this.#auth = auth;
  }

  static create({
    firestore,
    auth,
  }: {
    readonly firestore: Firestore;
    readonly auth: Auth;
  }): NodeFirebaseAdapter {
    return new NodeFirebaseAdapter({
      firestore,
      auth: NodeAuth.create(auth),
    });
  }

  static createNull(): NodeFirebaseAdapter {
    return new NodeFirebaseAdapter({
      firestore: undefined,
      auth: NodeAuth.createNull(),
    });
  }

  async onDocumentSnapshot<T>(
    ref: string,
    { next, error }: DocumentSnapshotListener<T>
  ) {
    const docRef = doc(this.#firestore, ref);

    return onSnapshot(docRef, {
      next: (snapshot) =>
        next({ id: snapshot.id, data: snapshot.data() as T | undefined }),
      error,
    });
  }

  async onCollectionSnapshot<T>(
    ref: string,
    { next, error }: CollectionSnapshotListener<T>
  ) {
    const collRef = collection(this.#firestore, ref);

    return onSnapshot(collRef, {
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
    await this.#auth.authStateReady();
    return this.#auth.currentUser ?? undefined;
  }

  async signInWithCustomToken(token: string): Promise<FirebaseUser> {
    const user = await signInWithCustomToken(this.#auth, token);
    return user.user;
  }

  async signOut() {
    await signOut(this.#auth);
  }
}
