import type { DocumentData } from "firebase/firestore";
import { type Logger } from "./log";
import type { IFirestore } from "./types";

export async function onSnapshotWithBackoff<T extends DocumentData>(
  firestore: IFirestore,
  ref: string,
  onSnapshotCallback: (snapshot: { id: string; data?: T }) => void,
  {
    logger,
    maxAttempts,
    initialDelay = 1000,
    maxDelay,
  }: {
    logger?: Logger;
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<() => void> {
  let resolved = false;

  const connect = () =>
    new Promise<() => void>(async (resolve, reject) => {
      const unsubscribe = await firestore.onDocumentSnapshot<T>(ref, {
        next: (snapshot) => {
          onSnapshotCallback(snapshot);
          if (!resolved) {
            resolved = true;
            resolve(unsubscribe);
          }
        },
        error: reject,
      });
    });

  const start = Date.now();
  let attempts = 1;
  let delay = initialDelay;

  while (true) {
    try {
      const result = await connect();
      logger?.verbose(
        `Successfully subscribed to Firestore document ${
          ref
        } after ${attempts} attempts and ${Date.now() - start} ms.`
      );
      return result;
    } catch (error) {
      if (maxAttempts !== undefined && attempts >= maxAttempts) {
        logger?.warn(
          `Error subscribing to Firestore document ${
            ref
          }. Giving up after ${attempts} attempts and ${Date.now() - start} ms.`
        );
        throw error;
      }

      logger?.warn(
        `Error subscribing to Firestore document ${
          ref
        } (${attempts} of ${maxAttempts ?? "unlimited"} attempts so far, ${
          Date.now() - start
        } ms elapsed). Trying again in ${delay} ms.`
      );
      await wait(delay);
      attempts++;
      delay = maxDelay ? Math.min(delay * 2, maxDelay) : delay * 2;
    }
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
