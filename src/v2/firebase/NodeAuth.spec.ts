import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { describe, expect, it } from "vitest";
import { firebaseConfig } from "./firebase-config.js";
import { NodeAuth } from "./NodeAuth.js";

describe("NodeFirebaseAdapter", () => {
  describe.skip("actual", () => {
    function initialize() {
      const app = initializeApp(firebaseConfig);

      const auth = getAuth(app);
      connectAuthEmulator(auth, "http://localhost:9099");

      return { app, auth };
    }

    it("user should initially be undefined", async () => {
      const { auth } = initialize();
      const adapter = NodeAuth.create(auth);

      await expect(adapter.getCurrentUser()).resolves.toBeUndefined();
    });

    it("user should authenticate with custom token", async () => {
      const { auth } = initialize();
      const adapter = NodeAuth.create(auth);

      const token = createToken("test1");
      await adapter.signInWithCustomToken(token);

      const user = await adapter.getCurrentUser();
      expect(user?.uid).toEqual("test1");
    });
  });

  describe("null", () => {
    it("user should initially be undefined", async () => {
      const adapter = NodeAuth.createNull();
      await expect(adapter.getCurrentUser()).resolves.toBeUndefined();
    });

    it("user should authenticate with custom token", async () => {
      const token = createToken("test1");

      const adapter = NodeAuth.createNull({
        expectedSignIns: [{ token, user: { uid: "test1" } }],
      });

      await adapter.signInWithCustomToken(token);

      const user = await adapter.getCurrentUser();
      expect(user?.uid).toEqual("test1");
    });
  });
});

function createToken(userId: string) {
  const header = { typ: "JWT", alg: "HS256" };
  const payload = {
    uid: userId,
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
  };
  const signature = "signature";

  return [header, payload, signature]
    .map((s) => JSON.stringify(s))
    .map((s) => Buffer.from(s).toString("base64").replace(/=/g, ""))
    .join(".");
}
