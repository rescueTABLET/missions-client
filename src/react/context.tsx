import { createContext, type PropsWithChildren, useContext } from "react";
import { type Missions } from "../connect.js";

const Context = createContext<Missions | undefined>(undefined);

export type MissionsContextProps = PropsWithChildren<{ missions: Missions }>;

export function MissionsContextProvider({
  children,
  missions,
}: MissionsContextProps) {
  return <Context.Provider value={missions}>{children}</Context.Provider>;
}

export function useMissionsContext(): Missions {
  const context = useContext(Context);
  if (!context)
    throw new Error("useMissionsContext() requires a MissionsContextProvider");
  return context;
}
