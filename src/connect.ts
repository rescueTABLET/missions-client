import { type Client } from "@hey-api/client-fetch";
import { type FirebaseApp } from "firebase/app";
import { RemoteMissionsApi, type Cache } from "./api.js";
import { connectMissionsFirebase, defaultFirebaseAdapter } from "./firebase.js";
import { type Logger } from "./log.js";
import { MissionsManager } from "./manager.js";

export type ConnectMissionsOptions = {
  apiKey: string;
  baseUrl?: string;
  userAgent?: string;
  cache?: Cache;
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
  cache,
  firebaseAppName,
  enableOfflinePersistence,
  logger,
}: ConnectMissionsOptions): Promise<MissionsWithFirebase> {
  const api = new RemoteMissionsApi({
    apiKey,
    baseUrl,
    userAgent,
    cache,
    logger,
  });

  const { user, firebase, firestore } = await connectMissionsFirebase({
    api,
    firebaseAppName,
    enableOfflinePersistence,
  });

  const manager = new MissionsManager({
    firebase: defaultFirebaseAdapter(firestore),
    userId: user.id,
    logger,
  });

  return { client: api.client, manager, firebase };
}
