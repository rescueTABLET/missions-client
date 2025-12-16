import { type Unsubscribe } from "../types.js";
import { EventEmitter } from "./EventEmitter.js";
import { type FirebaseAdapter } from "./firebase/types.js";

export type User = {
  readonly id: string;
  readonly email?: string;
  readonly displayName?: string;
  readonly defaultMissionGroups?: readonly string[];
  readonly missionIds: readonly string[];
  readonly permissions: readonly string[];
  readonly groupPermissions: Record<string, readonly string[]>;
  readonly groups: { readonly id: string; readonly name?: string }[];
};

export type UserManagerEvents = {
  readonly change: { readonly user?: User };
  readonly error: { readonly error: Error };
};

export const userManagerEventTypes: readonly (keyof UserManagerEvents)[] = [
  "change",
  "error",
];

export class UserManager extends EventEmitter<UserManagerEvents> {
  readonly #firebase: FirebaseAdapter;
  #unsubscribe?: Unsubscribe;
  #user?: User;

  constructor({
    firebase,
    userId,
  }: {
    readonly firebase: FirebaseAdapter;
    readonly userId: string;
  }) {
    super();
    this.#firebase = firebase;
    setTimeout(() => this.#subscribe(userId), 0);
  }

  async #subscribe(userId: string) {
    this.#unsubscribe = await this.#firebase.onDocumentSnapshot<FirestoreUser>(
      `users/${userId}`,
      {
        next: ({ id, data }) => {
          this.#user = id && data ? toUser(id, data) : undefined;
          this.emit("change", { user: this.#user });
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
  }
}

function toUser(id: string, data: FirestoreUser): User {
  return {
    id,
    email: data.email,
    displayName: data.displayName,
    defaultMissionGroups: data.defaultMissionGroups,
    missionIds: Object.entries(data.missions)
      .filter(([, enabled]) => enabled)
      .map(([missionId]) => missionId),
    permissions: Object.entries(data.permissions)
      .filter(([, enabled]) => enabled)
      .map(([permission]) => permission),
    groupPermissions: Object.fromEntries(
      Object.entries(data.groupPermissions).map(([groupId, permissions]) => [
        groupId,
        Object.entries(permissions)
          .filter(([, enabled]) => enabled)
          .map(([permission]) => permission),
      ])
    ),
    groups: Object.entries(data.groups).map(([groupId, groupData]) => ({
      id: groupId,
      name: groupData.name,
    })),
  };
}

export type FirestoreUser = {
  readonly missions: Record<string, boolean>;
  readonly email?: string;
  readonly displayName?: string;
  readonly defaultMissionGroups?: ReadonlyArray<string>;
  readonly roles?: ReadonlyArray<string>;
  readonly groups: Record<string, { readonly name?: string }>;
  readonly groupPermissions: Record<string, Record<string, boolean>>;
  readonly permissions: Record<string, boolean>;
};
