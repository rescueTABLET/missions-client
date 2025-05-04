import { type Client } from "@hey-api/client-fetch";
import { type FirebaseApp } from "firebase/app";
import { createMissionsClient } from "./api.js";
import { connectMissionsFirebase, defaultFirebaseAdapter } from "./firebase.js";
import { type Logger } from "./log.js";
import { MissionsManager } from "./manager.js";

export type ConnectMissionsOptions = {
  apiKey: string;
  baseUrl?: string;
  userAgent?: string;
  firebaseAppName?: string;
  enableOfflinePersistence?: boolean;
  logger?: Logger;
};

export type Missions = {
  readonly client: Client;
  readonly manager: MissionsManager;
};

export type MissionsWithFirebase = Missions & {
  readonly firebase: FirebaseApp;
};

export async function connectMissions({
  apiKey,
  baseUrl,
  userAgent,
  firebaseAppName,
  enableOfflinePersistence,
  logger,
}: ConnectMissionsOptions): Promise<MissionsWithFirebase> {
  const client = createMissionsClient({
    apiKey,
    baseUrl,
    userAgent,
  });

  const { user, firebase, firestore } = await connectMissionsFirebase({
    client,
    firebaseAppName,
    enableOfflinePersistence,
  });

  const manager = new MissionsManager({
    firebase: defaultFirebaseAdapter(firestore),
    userId: user.id,
    logger,
  });

  return { client, manager, firebase };
}
