import { describe, expect, it } from "vitest";
import { EventCollector } from "./EventCollector.js";
import {
  type FirestoreUser,
  UserManager,
  userManagerEventTypes,
} from "./UserManager.js";
import { NodeFirebaseAdapter } from "./firebase/NodeFirebaseAdapter.js";
import { FirestoreEmitter } from "./firebase/NodeFirestore.js";

describe("UserManager", () => {
  it("should subscribe to user document", async () => {
    const userId = "userId";

    const firestoreEmitter = new FirestoreEmitter();

    const firebase = NodeFirebaseAdapter.createNull({
      firestore: { emitter: firestoreEmitter },
    });

    const manager = new UserManager({ firebase, userId });
    const collector = new EventCollector(manager, userManagerEventTypes);

    firestoreEmitter.emitDocumentSnapshot("users/userId", {
      id: "userId",
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
            user: {
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
    const collector = new EventCollector(manager, userManagerEventTypes);

    firestoreEmitter.emitDocumentSnapshot("users/userId", {
      id: "userId",
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
    const collector = new EventCollector(manager, userManagerEventTypes);

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
