import { type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { collection, doc, getFirestore, onSnapshot } from "firebase/firestore";
import type {
  CollectionSnapshotListener,
  DocumentSnapshotListener,
  IFirebase,
} from "../types.js";

export function browserFirebaseAdapter(firebase: FirebaseApp): IFirebase {
  const firestore = getFirestore(firebase);
  const auth = getAuth(firebase);

  return {
    onDocumentSnapshot: async <T>(
      ref: string,
      { next, error }: DocumentSnapshotListener<T>
    ) =>
      onSnapshot(doc(firestore, ref), {
        next: (snapshot) =>
          next({ id: snapshot.id, data: snapshot.data() as T | undefined }),
        error,
      }),

    onCollectionSnapshot: async <T>(
      ref: string,
      { next, error }: CollectionSnapshotListener<T>
    ) =>
      onSnapshot(collection(firestore, ref), {
        next: (snapshot) =>
          next({
            documents: snapshot.docs.map((doc) => ({
              id: doc.id,
              data: doc.data() as T,
            })),
          }),
        error,
      }),

    onAuthStateChanged: async (listener) =>
      onAuthStateChanged(auth, (user) => listener(user ?? undefined)),

    signInWithCustomToken: async (token) => {
      const user = await signInWithCustomToken(auth, token);
      return user.user;
    },

    signOut: async () => {
      await signOut(auth);
    },
  };
}
