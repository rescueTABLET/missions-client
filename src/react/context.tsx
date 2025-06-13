import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { type MissionsManager } from "../manager.js";

export type MissionsContext = {
  readonly manager: MissionsManager;
};

const Context = createContext<MissionsContext | undefined>(undefined);

export type MissionsContextProps = PropsWithChildren<{
  manager: MissionsManager;
}>;

export function MissionsContextProvider({
  children,
  manager,
}: MissionsContextProps) {
  const context: MissionsContext = useMemo(() => ({ manager }), [manager]);
  return <Context value={context}>{children}</Context>;
}

export function useMissionsContext(): MissionsContext {
  const context = useContext(Context);
  if (!context)
    throw new Error("useMissionsContext() requires a MissionsContextProvider");
  return context;
}
