import { describe, expect, it } from "vitest";
import { EventCollector } from "./EventCollector.js";
import { NodeFirebaseAdapter } from "./firebase/NodeFirebaseAdapter.js";
import { FirestoreEmitter } from "./firebase/NodeFirestore.js";
import { firebaseDocumentObserverEventTypes } from "./FirebaseDocumentObserver.js";
import { type FirestoreUser, UserManager } from "./UserManager.js";

describe("UserManager", () => {
  it("should subscribe to user document", async () => {
    const userId = "userId";

    const firestoreEmitter = new FirestoreEmitter();

    const firebase = NodeFirebaseAdapter.createNull({
      firestore: { emitter: firestoreEmitter },
    });

    const manager = new UserManager({ firebase, userId });
    const collector = new EventCollector(
      manager,
      firebaseDocumentObserverEventTypes
    );

    firestoreEmitter.emitDocumentSnapshot("users/userId", {
      id: "userId",
      metadata: { fromCache: false },
      data: () =>
        ({
          groupPermissions: {},
          missions: {},
          groups: {},
          permissions: {},
          defaultMissionGroups: [],
        }) satisfies FirestoreUser,
    });

    const events = collector.done();
    expect(events).toEqual([
      {
        event: "data",
        args: [
          {
            data: {
              id: "userId",
              defaultMissionGroups: [],
              missionIds: [],
              permissions: [],
              groupPermissions: {},
              groups: [],
            },
          },
        ],
      },
    ]);
  });

  it("should handle non-existing user document", async () => {
    const userId = "userId";

    const firestoreEmitter = new FirestoreEmitter();

    const firebase = NodeFirebaseAdapter.createNull({
      firestore: { emitter: firestoreEmitter },
    });

    const manager = new UserManager({ firebase, userId });
    const collector = new EventCollector(
      manager,
      firebaseDocumentObserverEventTypes
    );

    firestoreEmitter.emitDocumentSnapshot("users/userId", {
      id: "userId",
      metadata: { fromCache: false },
      data: () => undefined,
    });

    const events = collector.done();
    expect(events).toEqual([
      {
        event: "data",
        args: [{ user: undefined }],
      },
    ]);
  });

  it("should forward errors", async () => {
    const userId = "userId";

    const firestoreEmitter = new FirestoreEmitter();

    const firebase = NodeFirebaseAdapter.createNull({
      firestore: { emitter: firestoreEmitter },
    });

    const manager = new UserManager({ firebase, userId });
    const collector = new EventCollector(
      manager,
      firebaseDocumentObserverEventTypes
    );

    const error = new Error("Test error");
    firestoreEmitter.emitDocumentError("users/userId", error);

    const events = collector.done();
    expect(events).toEqual([
      {
        event: "error",
        args: [{ error }],
      },
    ]);
  });
});
