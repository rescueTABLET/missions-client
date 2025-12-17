import type { MissionAggregates, MissionBase } from "../client/types.gen.js";
import type { FirebaseAdapter, SnapshotMetadata } from "./firebase/types.js";
import { FirebaseDocumentObserver } from "./FirebaseDocumentObserver.js";
import { type Logger } from "./log.js";
import type { RemoteMission } from "./types.js";

type FirestoreMission = MissionBase & MissionAggregates;

export class MissionManager extends FirebaseDocumentObserver<
  FirestoreMission,
  RemoteMission
> {
  constructor({
    firebase,
    missionId,
    logger,
  }: {
    readonly firebase: FirebaseAdapter;
    readonly missionId: string;
    readonly logger?: Logger;
  }) {
    super({
      firebase,
      ref: `missions-test/${missionId}`,
      convert: toMission,
      logger,
    });
  }
}

function toMission(
  id: string,
  doc: FirestoreMission,
  metadata: SnapshotMetadata
): RemoteMission {
  return {
    ...doc,
    id,
    stale: metadata.fromCache,
  };
}
