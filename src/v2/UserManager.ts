import { type FirebaseAdapter } from "./firebase/types.js";
import { FirebaseDocumentObserver } from "./FirebaseDocumentObserver.js";
import { type Logger } from "./log.js";

export type User = {
  readonly id: string;
  readonly email?: string;
  readonly displayName?: string;
  readonly defaultMissionGroups?: readonly string[];
  readonly missionIds: readonly string[];
  readonly permissions: readonly string[];
  readonly groupPermissions: Record<string, readonly string[]>;
  readonly groups: readonly Group[];
};

export type Group = {
  readonly id: string;
  readonly name?: string;
};

export class UserManager extends FirebaseDocumentObserver<FirestoreUser, User> {
  constructor({
    firebase,
    userId,
    logger,
  }: {
    readonly firebase: FirebaseAdapter;
    readonly userId: string;
    readonly logger?: Logger;
  }) {
    super({ firebase, ref: `users/${userId}`, convert: toUser, logger });
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
