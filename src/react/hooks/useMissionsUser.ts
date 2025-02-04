import { useEffect, useState } from "react";
import { MissionsManagerEventListener, MissionsUser } from "../../types";
import { useMissionsContext } from "../context";

export function useMissionsUser(): MissionsUser | undefined {
  const { manager } = useMissionsContext();
  const [user, setUser] = useState(manager.user);

  useEffect(() => {
    setUser(manager.user);

    const listener: MissionsManagerEventListener<"user_updated"> = ({ user }) =>
      setUser(user);

    manager.on("user_updated", listener);

    return () => {
      manager.off("user_updated", listener);
    };
  }, [manager]);

  return user;
}
