import { describe, expect, it } from "vitest";
import { UserInfo } from "../client";
import { Cache, cacheEventTypes } from "./Cache";
import { EventCollector } from "./EventCollector";
import { FirebaseConfigurationProvider } from "./FirebaseConfigurationProvider";
import { MissionsApi } from "./MissionsApi";

describe("FirebaseConfigurationProvider", () => {
  describe("actual", () => {
    describe("getUser", () => {
      it("should load user from Missions API and cache the value", async () => {
        const user: UserInfo = {
          id: "test",
          defaultMissionGroups: [],
          groups: [],
          permissions: [],
          roles: [],
        };

        const cache = Cache.createNull();

        const provider = new FirebaseConfigurationProvider({
          missionsApi: MissionsApi.createNull({ user }),
          cache,
          cachePrefix: "test",
        });

        const collector = new EventCollector(cache, cacheEventTypes);

        await expect(provider.getUser()).resolves.toEqual(user);

        const events = collector.done();
        expect(events).toEqual([
          {
            event: "itemSet",
            args: [{ key: "test:user", value: JSON.stringify(user) }],
          },
        ]);
      });

      it("should throw if Missions API replies with 401", async () => {
        const provider = new FirebaseConfigurationProvider({
          missionsApi: MissionsApi.createNull({ user: { status: 401 } }),
          cache: Cache.createNull(),
          cachePrefix: "test",
        });

        await expect(provider.getUser()).rejects.toThrow(
          "Invalid Missions API Key"
        );
      });

      it("should revert to cached value if Missions API throws generic error", async () => {
        const user: UserInfo = {
          id: "test",
          defaultMissionGroups: [],
          groups: [],
          permissions: [],
          roles: [],
        };

        const provider = new FirebaseConfigurationProvider({
          missionsApi: MissionsApi.createNull({ user: { error: true } }),
          cache: Cache.createNull({
            items: { "test:user": JSON.stringify(user) },
          }),
          cachePrefix: "test",
        });

        await expect(provider.getUser()).resolves.toEqual(user);
      });

      it("should throw if Missions API throws generic error and no value cached", async () => {
        const provider = new FirebaseConfigurationProvider({
          missionsApi: MissionsApi.createNull({ user: { error: true } }),
          cache: Cache.createNull(),
          cachePrefix: "test",
        });

        await expect(provider.getUser()).rejects.toThrow(
          "Could not load data from missions API and no value found in cache."
        );
      });
    });
  });
});
