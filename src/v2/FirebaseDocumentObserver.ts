import { EventEmitter } from "./EventEmitter.js";
import type {
  FirebaseAdapter,
  SnapshotMetadata,
  Unsubscribe,
} from "./firebase/types.js";
import { type Logger } from "./log.js";

export type FirebaseDocumentObserverEvents<TData> = {
  readonly data: { readonly data?: TData };
  readonly error: { readonly error: Error };
  readonly close: {};
};

export const firebaseDocumentObserverEventTypes = [
  "data",
  "error",
  "close",
] as const;

export type Converter<TFirestore, TData> = (
  id: string,
  data: TFirestore,
  metadata: SnapshotMetadata
) => TData;

export class FirebaseDocumentObserver<TFirestore, TData> extends EventEmitter<
  FirebaseDocumentObserverEvents<TData>
> {
  readonly #firebase: FirebaseAdapter;
  readonly #convert: Converter<TFirestore, TData>;
  readonly #logger?: Logger;
  #unsubscribe?: Unsubscribe;

  constructor({
    firebase,
    ref,
    convert,
    logger,
  }: {
    readonly firebase: FirebaseAdapter;
    readonly ref: string;
    readonly convert: Converter<TFirestore, TData>;
    readonly logger?: Logger;
  }) {
    super();
    this.#firebase = firebase;
    this.#convert = convert;
    this.#logger = logger;
    this.#subscribe(ref);
  }

  async #subscribe(ref: string) {
    this.#logger?.verbose(
      `FirebaseDocumentObserver: subscribing to document ${ref}…`
    );

    this.#unsubscribe = await this.#firebase.onDocumentSnapshot<TFirestore>(
      ref,
      {
        next: ({ id, data, metadata }) => {
          const item = data ? this.#convert(id, data, metadata) : undefined;
          this.emit("data", { data: item });
        },
        error: (error) => {
          this.emit("error", { error });
        },
      }
    );
  }

  override async close() {
    this.#unsubscribe?.();
    super.close();
    this.emit("close", {});
  }
}
