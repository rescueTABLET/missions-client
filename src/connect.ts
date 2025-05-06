import { type Client } from "@hey-api/client-fetch";
import { RemoteMissionsApi, type Cache } from "./api.js";
import { connectMissionsFirebase } from "./firebase.js";
import { type Logger } from "./log.js";
import { MissionsManager } from "./manager.js";
import type { IFirebase } from "./types.js";

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
  readonly firebase: IFirebase;
  readonly manager: MissionsManager;
};

export async function connectMissions({
  apiKey,
  baseUrl,
  userAgent,
  cache,
  firebaseAppName,
  enableOfflinePersistence,
  logger,
}: ConnectMissionsOptions): Promise<Missions> {
  const api = new RemoteMissionsApi({
    apiKey,
    baseUrl,
    userAgent,
    cache,
    logger,
  });

  const { user, firebase, adapter } = await connectMissionsFirebase({
    api,
    firebaseAppName,
    enableOfflinePersistence,
    logger,
  });

  const manager = new MissionsManager({
    firebase: adapter,
    userId: user.id,
    logger,
  });

  return { client: api.client, manager, firebase: adapter };
}
