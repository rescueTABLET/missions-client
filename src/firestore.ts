import type { MissionAggregates, MissionBase } from "./client/types.gen.js";
import type { RemoteMission } from "./types.js";

export type FirestoreMission = MissionBase & MissionAggregates;

export function fromFirestoreMission(
  id: string,
  data: FirestoreMission,
  stale?: boolean
): RemoteMission {
  return {
    ...data,
    id,
    stale: stale ?? false,
  };
}

export type FirestoreUser = {
  missions: Record<string, boolean>;
  email?: string;
  displayName?: string;
  defaultMissionGroups?: ReadonlyArray<string>;
  roles?: ReadonlyArray<string>;
  groups: Record<string, GroupInfo>;
  groupPermissions: Record<string, Record<string, boolean>>;
  permissions: Record<string, boolean>;
};

export type GroupInfo = {
  name?: string;
};
