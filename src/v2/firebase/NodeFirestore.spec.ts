import { describe, expect, it } from "vitest";
import {
  CollectionSnapshot,
  type DocumentSnapshot,
  FirestoreEmitter,
  NodeFirestore,
} from "./NodeFirestore";

describe("NodeFirestore", () => {
  describe("null", () => {
    describe("emitDocumentSnapshot", () => {
      it("should do nothing when no observer", async () => {
        const emitter = new FirestoreEmitter();
        NodeFirestore.createNull({ emitter });
        emitter.emitDocumentSnapshot("path/to/doc", {
          id: "doc",
          metadata: { fromCache: false },
          data: () => ({ field: "value" }),
        });
      });

      it("should emit document snapshot", async () => {
        const emitter = new FirestoreEmitter();
        const firestore = NodeFirestore.createNull({ emitter });

        const result = await new Promise<DocumentSnapshot>(
          (resolve, reject) => {
            firestore.onDocumentSnapshot("path/to/doc", {
              next: resolve,
              error: reject,
            });

            emitter.emitDocumentSnapshot("path/to/doc", {
              id: "doc",
              metadata: { fromCache: false },
              data: () => ({ field: "value" }),
            });
          }
        );

        expect(result.id).toEqual("doc");
        expect(result.data()).toEqual({ field: "value" });
      });

      it("should stop emitting document snapshots after unsubscribe", async () => {
        const emitter = new FirestoreEmitter();
        const firestore = NodeFirestore.createNull({ emitter });

        const snapshots: DocumentSnapshot[] = [];

        const unsubscribe = await firestore.onDocumentSnapshot("path/to/doc", {
          next: (snapshot) => snapshots.push(snapshot),
        });

        emitter.emitDocumentSnapshot("path/to/doc", {
          id: "doc",
          metadata: { fromCache: false },
          data: () => ({ field: "value" }),
        });

        unsubscribe();

        emitter.emitDocumentSnapshot("path/to/doc", {
          id: "doc",
          metadata: { fromCache: false },
          data: () => ({ field: "value" }),
        });

        expect(snapshots).toHaveLength(1);
      });
    });

    describe("emitDocumentError", () => {
      it("should do nothing when no observer", async () => {
        const emitter = new FirestoreEmitter();
        NodeFirestore.createNull({ emitter });
        emitter.emitDocumentError("path/to/doc", new Error("Test error"));
      });

      it("should emit document error", async () => {
        const emitter = new FirestoreEmitter();
        const firestore = NodeFirestore.createNull({ emitter });

        const result = new Promise<DocumentSnapshot>((resolve, reject) => {
          firestore.onDocumentSnapshot("path/to/doc", {
            next: resolve,
            error: reject,
          });

          emitter.emitDocumentError("path/to/doc", new Error("Test error"));
        });

        await expect(result).rejects.toThrowError("Test error");
      });
    });

    it("should emit collection snapshot", async () => {
      const emitter = new FirestoreEmitter();
      const firestore = NodeFirestore.createNull({ emitter });

      const result = await new Promise<CollectionSnapshot>(
        (resolve, reject) => {
          firestore.onCollectionSnapshot("path/to/doc", {
            next: resolve,
            error: reject,
          });

          emitter.emitCollectionSnapshot("path/to/doc", {
            id: "docs",
            metadata: { fromCache: false },
            docs: [
              {
                id: "doc1",
                metadata: { fromCache: false },
                data: () => ({ field: "value1" }),
              },
              {
                id: "doc2",
                metadata: { fromCache: false },
                data: () => ({ field: "value2" }),
              },
            ],
          });
        }
      );

      expect(result.id).toEqual("docs");
      expect(result.docs).toHaveLength(2);
      expect(result.docs[0].id).toEqual("doc1");
      expect(result.docs[0].data()).toEqual({ field: "value1" });
      expect(result.docs[1].id).toEqual("doc2");
      expect(result.docs[1].data()).toEqual({ field: "value2" });
    });

    it("should emit collection error", async () => {
      const emitter = new FirestoreEmitter();
      const firestore = NodeFirestore.createNull({ emitter });

      const result = new Promise<CollectionSnapshot>((resolve, reject) => {
        firestore.onCollectionSnapshot("path/to/collection", {
          next: resolve,
          error: reject,
        });

        emitter.emitCollectionError(
          "path/to/collection",
          new Error("Test error")
        );
      });

      await expect(result).rejects.toThrowError("Test error");
    });
  });
});
