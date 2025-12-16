import { describe, expect, it } from "vitest";
import type { FirebaseConfig, UserInfo } from "../client/types.gen.js";
import { MissionsApi } from "./MissionsApi.js";

describe("MissionsApi", () => {
  describe("null", () => {
    describe("getUser", () => {
      it("should return user when configured", async () => {
        const user: UserInfo = {
          id: "test",
          defaultMissionGroups: [],
          groups: [],
          permissions: [],
          roles: [],
        };
        const api = MissionsApi.createNull({ user });
        await expect(api.getUser()).resolves.toEqual(user);
      });

      it("should return 404 when no user configured", async () => {
        const api = MissionsApi.createNull({});
        await expect(api.getUser()).rejects.toThrowError("Not Found");
      });
    });

    describe("getFirebaseConfig", () => {
      it("should return config when configured", async () => {
        const firebaseConfig: FirebaseConfig = { config: {}, token: "token" };
        const api = MissionsApi.createNull({ firebaseConfig });
        await expect(api.getFirebaseConfig()).resolves.toEqual(firebaseConfig);
      });

      it("should return 404 when no config configured", async () => {
        const api = MissionsApi.createNull({});
        await expect(api.getFirebaseConfig()).rejects.toThrowError("Not Found");
      });
    });
  });
});
