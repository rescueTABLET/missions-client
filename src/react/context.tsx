import { type Client } from "@hey-api/client-fetch";
import { createContext, useContext, type ReactNode } from "react";
import { MissionsManager, type User } from "../../src";

export type MissionsContext = {
  user: User;
  client: Client;
  manager: MissionsManager;
};

const Context = createContext<MissionsContext | undefined>(undefined);

export type MissionsContextProps = MissionsContext & { children: ReactNode };

export function MissionsContextProvider({
  children,
  ...context
}: MissionsContextProps) {
  return <Context.Provider value={context}>{children}</Context.Provider>;
}

export function useMissionsContext(): MissionsContext {
  const context = useContext(Context);
  if (!context)
    throw new Error("useMissionsContext() requires a MissionsContextProvider");
  return context;
}
