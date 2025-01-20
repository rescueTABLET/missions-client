import { type Client } from "@hey-api/client-fetch";
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { getFirebaseConfig, user as getUser, type User } from "./client";
import { type DocumentSnapshotListener, type IFirebase } from "./types";

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
  };
}

export async function connectMissionsFirebase(args: {
  client: Client;
  firebaseAppName?: string;
}): Promise<{ user: User; firebase: FirebaseApp }> {
  const [user, firebaseConfig] = await Promise.all([
    getUser({ client: args.client, throwOnError: true }).then(
      (r: any) => r.data
    ),
    getFirebaseConfig({ client: args.client, throwOnError: true }).then(
      (r: any) => r.data
    ),
  ]);

  const firebase = initializeApp(firebaseConfig.config, {
    name: args.firebaseAppName ?? "rescuetablet/missions",
    automaticDataCollectionEnabled: false,
  });

  await signInWithCustomToken(getAuth(firebase), firebaseConfig.token);

  return { user, firebase };
}
