import { doc, type Firestore, onSnapshot } from "firebase/firestore";
import { type DocumentSnapshotListener, type IFirestore } from "./types";

export function firestoreAdapter(firestore: Firestore): IFirestore {
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
  };
}
