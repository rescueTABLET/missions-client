import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { firebaseConfig } from "../firebase-config.js";
import { MissionsManager } from "../manager.js";
import { RemoteMissionsApi } from "../missions-api.js";
import { browserFirebaseAdapter } from "./adapter.js";
import { browserLogger } from "./log.js";

export function createMissionsManager(): MissionsManager {
  const firebase = initializeApp(firebaseConfig, {
    name: "rescuetablet/missions",
    automaticDataCollectionEnabled: false,
  });

  initializeFirestore(firebase, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

  const logger = browserLogger;
  const firebaseAdapter = browserFirebaseAdapter(firebase);
  const missionsApi = new RemoteMissionsApi({ logger });

  return new MissionsManager({
    firebase: firebaseAdapter,
    missionsApi,
    logger,
  });
}
