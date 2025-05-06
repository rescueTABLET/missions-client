import type { UserInfo } from "./client/types.gen.js";
import { type Logger } from "./log.js";
import type { FirebaseUser, IFirebase, Unsubscribe } from "./types.js";

export async function authorizeFirebase({
  firebase,
  user,
  token,
  logger,
}: {
  firebase: IFirebase;
  user: UserInfo;
  token: string;
  logger?: Logger;
}) {
  let authorization = await getFirebaseAuthorization(firebase);

  if (authorization && authorization.uid !== user.id) {
    logger?.info(`Signing out previous Firebase user ${authorization.uid}…`);
    authorization = undefined;
    await firebase.signOut();
  }

  if (!authorization) {
    logger?.info("Authorizing Firebase…");
    await firebase.signInWithCustomToken(token);
  } else {
    logger?.info("Firebase is already authorized.");
  }
}

async function getFirebaseAuthorization(
  firebase: IFirebase
): Promise<FirebaseUser | undefined> {
  let unsubscribe: Unsubscribe | undefined;

  return new Promise<FirebaseUser | undefined>((resolve) => {
    firebase.onAuthStateChanged(resolve).then((s) => (unsubscribe = s));
  }).finally(() => {
    unsubscribe?.();
  });
}
