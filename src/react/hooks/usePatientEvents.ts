import { useEffect, useState } from "react";
import type {
  Identifiable,
  PatientCreatedEvent,
  PatientDeletedEvent,
  PatientUpdatedEvent,
} from "../../client/types.gen.js";
import { useMissionsContext } from "../context.js";

export type PatientEventData =
  | PatientCreatedEvent
  | PatientUpdatedEvent
  | PatientDeletedEvent;

export type PatientEvent = Identifiable & PatientEventData;

export function usePatientEvents(
  missionId: string,
  patientId: string,
  onError?: (error: Error) => void
): ReadonlyArray<PatientEvent> {
  const [events, setEvents] = useState<ReadonlyArray<PatientEvent>>([]);
  const { manager } = useMissionsContext();

  useEffect(() => {
    manager.firebase.onCollectionSnapshot<PatientEventData>(
      `missions/${missionId}/patients/${patientId}/events`,
      {
        next: (snapshot) => {
          setEvents(
            snapshot.documents.map((doc) => ({ id: doc.id, ...doc.data }))
          );
        },
        error: (error) => {
          onError?.(error);
        },
      }
    );
  }, [missionId, patientId]);

  return events;
}
