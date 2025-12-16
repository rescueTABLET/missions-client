import { signInWithCustomToken, type Auth } from "firebase/auth";
import type { FirebaseUser } from "./types";

type SignInWithCustomTokenResult = { readonly user: FirebaseUser };

interface FirebaseAuthApi {
  currentUser: FirebaseUser | null;
  authStateReady(): Promise<void>;
  signInWithCustomToken(token: string): Promise<SignInWithCustomTokenResult>;
}

export class NodeAuth {
  readonly #auth: FirebaseAuthApi;

  constructor(auth: FirebaseAuthApi) {
    this.#auth = auth;
  }

  static create(auth: Auth): NodeAuth {
    return new NodeAuth({
      currentUser: auth.currentUser,
      authStateReady: auth.authStateReady.bind(auth),
      signInWithCustomToken: (token: string) =>
        signInWithCustomToken(auth, token),
    });
  }

  static createNull({
    expectedSignIns,
  }: {
    expectedSignIns?: readonly {
      readonly token: string;
      readonly user: FirebaseUser;
    }[];
  } = {}): NodeAuth {
    return new NodeAuth(new FirebaseAuthStub({ expectedSignIns }));
  }

  async getCurrentUser(): Promise<FirebaseUser | undefined> {
    await this.#auth.authStateReady();
    return this.#auth.currentUser ?? undefined;
  }

  async signInWithCustomToken(token: string): Promise<FirebaseUser> {
    const { user } = await this.#auth.signInWithCustomToken(token);
    return user;
  }
}

class FirebaseAuthStub implements FirebaseAuthApi {
  currentUser: FirebaseUser | null = null;

  readonly #expectedSignIns: readonly {
    readonly token: string;
    readonly user: FirebaseUser;
  }[];

  constructor({
    expectedSignIns = [],
  }: {
    expectedSignIns?: readonly {
      readonly token: string;
      readonly user: FirebaseUser;
    }[];
  }) {
    this.#expectedSignIns = expectedSignIns;
  }

  async authStateReady(): Promise<void> {
    return;
  }

  async signInWithCustomToken(
    token: string
  ): Promise<SignInWithCustomTokenResult> {
    for (const expected of this.#expectedSignIns) {
      if (expected.token === token) {
        this.currentUser = expected.user;
        return { user: expected.user };
      }
    }

    this.currentUser = null;
    throw new Error("Unexpected sign in token");
  }
}
