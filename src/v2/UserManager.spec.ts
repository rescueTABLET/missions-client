import { describe, expect, it } from "vitest";
import { EventCollector } from "./EventCollector.js";
import {
  type FirestoreUser,
  UserManager,
  userManagerEventTypes,
} from "./UserManager.js";
import { FirebaseAdapterStub } from "./firebase/FirebaseAdapterStub.js";

describe("UserManager", () => {
  it("should work", async () => {
    const userId = "userId";

    const firebase = new FirebaseAdapterStub({
      documents: {
        "users/userId": {
          groupPermissions: {},
          missions: {},
          groups: {},
          permissions: {},
          defaultMissionGroups: [],
        } satisfies FirestoreUser,
      },
    });

    const manager = new UserManager({ firebase, userId });
    const collector = new EventCollector(manager, userManagerEventTypes);

    // wait one tick
    await new Promise((resolve) => setTimeout(resolve, 16));
    const events = collector.done();
    expect(events).toEqual([
      {
        event: "change",
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
});
