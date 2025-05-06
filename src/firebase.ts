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
  type Auth,
  type User,
} from "firebase/auth";
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
import { type Logger } from "./log.js";
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
  logger,
}: {
  api: MissionsApi;
  firebaseAppName?: string;
  enableOfflinePersistence?: boolean;
  logger?: Logger;
}): Promise<{ user: UserInfo; firebase: FirebaseApp; firestore: Firestore }> {
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

  const firestore = initializeFirestore(firebase, {
    localCache: enableOfflinePersistence
      ? persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        })
      : undefined,
  });

  await authorizeFirebase({ firebase, user, token, logger });

  return { user, firebase, firestore };
}

async function authorizeFirebase({
  firebase,
  user,
  token,
  logger,
}: {
  firebase: FirebaseApp;
  user: UserInfo;
  token: string;
  logger?: Logger;
}) {
  const auth = getAuth(firebase);
  let authorization = await getFirebaseAuthorization(auth);

  if (authorization && authorization.uid !== user.id) {
    logger?.info(`Signing out previous Firebase user ${authorization.uid}…`);
    authorization = undefined;
    await signOut(auth);
  }

  if (!authorization) {
    logger?.info("Authorizing Firebase…");
    await signInWithCustomToken(auth, token);
  } else {
    logger?.info("Firebase is already authorized.");
  }
}

async function getFirebaseAuthorization(auth: Auth): Promise<User | undefined> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, {
      next: (auth) => {
        unsubscribe();
        resolve(auth ?? undefined);
      },
      error: (error) => {
        unsubscribe();
        reject(error);
      },
      complete: () => {},
    });
  });
}
