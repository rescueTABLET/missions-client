import type { MissionAggregates, MissionBase } from "../client";

export type Stale = { stale: boolean };

export type RemoteMission = MissionBase & MissionAggregates & Stale;
