import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import {
  doc,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { type MissionsApi } from "./api.js";
import type { UserInfo } from "./client/types.gen.js";
import type { DocumentSnapshotListener, IFirebase } from "./types.js";

export function defaultFirebaseAdapter(firestore: Firestore): IFirebase {
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

export async function connectMissionsFirebase({
  api,
  firebaseAppName,
  enableOfflinePersistence,
}: {
  api: MissionsApi;
  firebaseAppName?: string;
  enableOfflinePersistence?: boolean;
}): Promise<{ user: UserInfo; firebase: FirebaseApp; firestore: Firestore }> {
  const [user, firebaseConfig] = await Promise.all([
    api.getUser(),
    api.getFirebaseConfig(),
  ]);

  const firebase = initializeApp(firebaseConfig.config, {
    name: firebaseAppName ?? "rescuetablet/missions",
    automaticDataCollectionEnabled: false,
  });

  const firestore = initializeFirestore(firebase, {
    localCache: enableOfflinePersistence
      ? persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        })
      : undefined,
  });

  await signInWithCustomToken(getAuth(firebase), firebaseConfig.token);

  return { user, firebase, firestore };
}
