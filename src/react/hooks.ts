import { useEffect, useState } from "react";
import type { ManagedMission, MissionsManagerEventListener } from "../types.js";
import { useMissionsContext } from "./context.js";

export function useMissions(): Record<string, ManagedMission> {
  const { manager } = useMissionsContext();
  const [missions, setMissions] = useState(
    Object.fromEntries(manager.missions)
  );

  useEffect(() => {
    setMissions(Object.fromEntries(manager.missions));

    const addedListener: MissionsManagerEventListener<"mission_added"> = (
      mission
    ) => setMissions((ms) => ({ ...ms, [mission.id]: mission }));
    manager.on("mission_added", addedListener);

    const updatedListener: MissionsManagerEventListener<"mission_updated"> = (
      mission
    ) => setMissions((ms) => ({ ...ms, [mission.id]: mission }));
    manager.on("mission_updated", updatedListener);

    const removedListener: MissionsManagerEventListener<"mission_removed"> = ({
      id,
    }) =>
      setMissions((ms) =>
        Object.fromEntries(Object.entries(ms).filter(([key]) => key !== id))
      );
    manager.on("mission_removed", removedListener);

    return () => {
      manager.off("mission_added", addedListener);
      manager.off("mission_updated", updatedListener);
      manager.off("mission_removed", removedListener);
    };
  }, [manager]);

  return missions;
}
