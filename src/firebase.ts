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
  doc,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { type MissionsApi } from "./api.js";
import { authorizeFirebase } from "./auth.js";
import type { UserInfo } from "./client/types.gen.js";
import { type Logger } from "./log.js";
import type { DocumentSnapshotListener, IFirebase } from "./types.js";

export function defaultFirebaseAdapter(firebase: FirebaseApp): IFirebase {
  return {
    onDocumentSnapshot: async <T>(
      ref: string,
      { next, error }: DocumentSnapshotListener<T>
    ) =>
      onSnapshot(doc(getFirestore(firebase), ref), {
        next: (snapshot) =>
          next({ id: snapshot.id, data: snapshot.data() as T | undefined }),
        error,
      }),

    onAuthStateChanged: async (listener) =>
      onAuthStateChanged(getAuth(firebase), (auth) =>
        listener(auth ?? undefined)
      ),

    signInWithCustomToken: async (token) => {
      await signInWithCustomToken(getAuth(firebase), token);
    },

    signOut: async () => {
      await signOut(getAuth(firebase));
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

  logger?.info(
    `Initializing Firestore with offline persistence ${enableOfflinePersistence ? "enabled" : "disabled"}`
  );

  initializeFirestore(firebase, {
    localCache: enableOfflinePersistence
      ? persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        })
      : undefined,
  });

  const adapter = defaultFirebaseAdapter(firebase);

  await authorizeFirebase({ firebase: adapter, user, token, logger });

  return { user, firebase, adapter };
}
