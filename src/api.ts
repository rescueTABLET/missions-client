import { createClient, type Client } from "@hey-api/client-fetch";
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirebaseConfig, user as getUser, type User } from "./client";

export type MissionsApiArgs = {
  apiKey: string;
  baseUrl?: string;
  userAgent?: string;
};

export function createMissionsClient(args: MissionsApiArgs): Client {
  return createClient({
    baseUrl: args.baseUrl,
    headers: {
      authorization: args.apiKey,
      ...(args.userAgent ? { "user-agent": args.userAgent } : {}),
    },
  });
}

export async function connectMissionsFirestore(args: {
  client: Client;
  firebaseAppName?: string;
}): Promise<{ user: User; firebase: FirebaseApp }> {
  const [user, firebaseConfig] = await Promise.all([
    getUser({ client: args.client, throwOnError: true }),
    getFirebaseConfig({ client: args.client, throwOnError: true }),
  ]);

  const firebase = initializeApp(firebaseConfig.config, args.firebaseAppName);
  await signInWithCustomToken(getAuth(firebase), firebaseConfig.token);

  return { user, firebase };
}
