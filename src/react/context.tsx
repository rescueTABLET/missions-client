import { createContext, useContext, type ReactNode } from "react";
import { type Missions } from "../../src";

const Context = createContext<Missions | undefined>(undefined);

export type MissionsContextProps = Missions & { children: ReactNode };

export function MissionsContextProvider({
  children,
  ...context
}: MissionsContextProps) {
  return <Context.Provider value={context}>{children}</Context.Provider>;
}

export function useMissionsContext(): Missions {
  const context = useContext(Context);
  if (!context)
    throw new Error("useMissionsContext() requires a MissionsContextProvider");
  return context;
}
