import { type FirebaseAppSettings, initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { firebaseConfig } from "../firebase-config.js";
import { type Logger } from "../log.js";
import { MissionsManager } from "../manager.js";
import { RemoteMissionsApi } from "../missions-api.js";
import { browserFirebaseAdapter } from "./adapter.js";
import { browserLogger } from "./log.js";

export type CreateMissionsManagerOptions = {
  firebase?: FirebaseAppSettings;
  baseUrl?: string;
  userAgent?: string;
  logger?: Logger;
};

export function createMissionsManager(
  options: CreateMissionsManagerOptions = {}
): MissionsManager {
  const firebase = initializeApp(firebaseConfig, {
    name: "rescuetablet/missions",
    automaticDataCollectionEnabled: false,
    ...options.firebase,
  });

  initializeFirestore(firebase, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

  const logger = options.logger ?? browserLogger;
  const firebaseAdapter = browserFirebaseAdapter(firebase);
  const missionsApi = new RemoteMissionsApi({
    baseUrl: options.baseUrl,
    userAgent: options.userAgent,
    logger,
  });

  return new MissionsManager({
    firebase: firebaseAdapter,
    missionsApi,
    logger,
  });
}
