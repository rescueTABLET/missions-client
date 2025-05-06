import {
  initializeApp,
  type FirebaseApp,
  type FirebaseAppSettings,
} from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { type MissionsApi } from "./api.js";
import { authorizeFirebase } from "./auth.js";
import type { UserInfo } from "./client/types.gen.js";
import { type Logger } from "./log.js";
import type {
  CollectionSnapshotListener,
  DocumentSnapshotListener,
  IFirebase,
} from "./types.js";

export function defaultFirebaseAdapter(
  firebase: FirebaseApp,
  enableOfflinePersistence?: boolean
): IFirebase {
  const firestore = initializeFirestore(firebase, {
    localCache: enableOfflinePersistence
      ? persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        })
      : undefined,
  });
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
      await signInWithCustomToken(auth, token);
    },

    signOut: async () => {
      await signOut(auth);
    },
  };
}

export async function connectMissionsFirebase({
  api,
  firebaseAppName,
  enableOfflinePersistence,
  logger,
}: {
  api: MissionsApi;
  firebaseAppName?: string;
  enableOfflinePersistence?: boolean;
  logger?: Logger;
}): Promise<{ user: UserInfo; firebase: FirebaseApp; adapter: IFirebase }> {
  const [user, { config, token }] = await Promise.all([
    api.getUser(),
    api.getFirebaseConfig(),
  ]);

  const settings: FirebaseAppSettings = {
    name: firebaseAppName ?? "rescuetablet/missions",
    automaticDataCollectionEnabled: false,
  };

  const firebase = initializeApp(config, settings);

  const adapter = defaultFirebaseAdapter(firebase, enableOfflinePersistence);

  await authorizeFirebase({ firebase: adapter, user, token, logger });

  return { user, firebase, adapter };
}
