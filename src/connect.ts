import { type Client } from "@hey-api/client-fetch";
import { createMissionsClient } from "./api.js";
import { type UserInfo } from "./client/types.gen.js";
import { connectMissionsFirebase, defaultFirebaseAdapter } from "./firebase.js";
import { type Logger } from "./log.js";
import { MissionsManager } from "./manager.js";

export type ConnectMissionsOptions = {
  apiKey: string;
  baseUrl?: string;
  userAgent?: string;
  firebaseAppName?: string;
  logger?: Logger;
};

export type Missions = {
  readonly client: Client;
  readonly user: UserInfo;
  readonly manager: MissionsManager;
};

export async function connectMissions(
  options: ConnectMissionsOptions
): Promise<Missions> {
  const { apiKey, baseUrl, userAgent, firebaseAppName, logger } = options;

  const client = createMissionsClient({
    apiKey,
    baseUrl,
    userAgent,
  });

  const { user, firebase } = await connectMissionsFirebase({
    client,
    firebaseAppName,
  });

  const manager = new MissionsManager({
    firebase: defaultFirebaseAdapter(firebase),
    userId: user.id,
    logger,
  });

  return { client, user, manager };
}
