import {
  type Action,
  type Identifiable,
  type MapElement,
  type Mission,
  type Patient,
  type Report,
  type Resource,
  type Section,
} from "./client";
import type { RemoteMission } from "./types";

export type FirebaseMissionData = Omit<
  Mission,
  | "id"
  | "resources"
  | "actions"
  | "reports"
  | "mapElements"
  | "sections"
  | "patients"
> & {
  resources?: Record<string, Omit<Resource, "id">>;
  removedResources?: Record<string, Omit<Resource, "id">>;
  actions?: Record<string, Omit<Action, "id">>;
  reports?: Record<string, Omit<Report, "id">>;
  mapElements?: Record<string, Omit<MapElement, "id">>;
  patients?: Record<string, Omit<Patient, "id">>;
  sections?: Record<string, Omit<Section, "id">>;
  patientIds?: ReadonlyArray<string>;
};

export function fromFirebaseMission(
  id: string,
  data: FirebaseMissionData,
  stale?: boolean
): RemoteMission {
  return {
    ...data,
    id,
    resources: mapToArray(data.resources),
    removedResources: mapToArray(data.removedResources),
    actions: mapToArray(data.actions),
    reports: mapToArray(data.reports),
    patients: mapToArray(data.patients),
    mapElements: mapToArray(data.mapElements),
    sections: mapToArray(data.sections),
    stale: stale ?? false,
  };
}

function mapToArray<T extends Identifiable>(
  map?: Record<string, Omit<T, "id">>
): Array<T> {
  return Object.entries(map ?? {}).map(([id, element]: [string, any]) => ({
    id,
    ...element,
  }));
}
