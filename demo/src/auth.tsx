import {
  createContext,
  startTransition,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { connectMissions, LocalStorageCache, type Missions } from "../../src";
import { MissionsContextProvider } from "../../src/react";

type AuthContext = {
  signOut: () => void;
};

const Context = createContext<AuthContext>({ signOut: () => {} });

const localStorageKey = "rescuetablet:missions-client:demo:apiKey";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Missions>();

  const signOut = useCallback(() => {
    setMissions(undefined);
    localStorage.removeItem(localStorageKey);
  }, []);

  return missions ? (
    <Context.Provider value={{ signOut }}>
      <MissionsContextProvider missions={missions}>
        <>{children}</>
      </MissionsContextProvider>
    </Context.Provider>
  ) : (
    <SignIn setMissions={setMissions} />
  );
}

export function useSignOut(): () => void {
  return useContext(Context).signOut;
}

function SignIn({
  setMissions,
}: {
  setMissions: (context?: Missions) => void;
}) {
  const [apiKey, setApiKey] = useState("");

  const [error, submitAction, pending] = useActionState<
    Error | undefined,
    FormData
  >(async (_, form) => {
    try {
      const apiKey = form.get("apiKey");
      if (typeof apiKey !== "string") {
        throw new Error("No API key provided");
      }

      const context = await connectMissions({
        apiKey,
        cache: new LocalStorageCache(),
        enableOfflinePersistence: true,
      });
      localStorage.setItem(localStorageKey, apiKey);
      setMissions(context);
      return undefined;
    } catch (error: any) {
      setMissions(undefined);
      localStorage.removeItem(localStorageKey);
      return error;
    }
  }, undefined);

  useEffect(() => {
    const storedApiKey = localStorage.getItem(localStorageKey);
    if (storedApiKey) {
      setApiKey(storedApiKey);

      startTransition(() => {
        const form = new FormData();
        form.set("apiKey", storedApiKey);
        submitAction(form);
      });
    }
  }, [submitAction]);

  return (
    <div className="container py-4">
      <h1 className="display-3">Sign In</h1>
      <form action={submitAction}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="form-label">
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="none"
            required
            disabled={pending}
            className="form-control"
          />
        </div>
        {error && (
          <div className="alert alert-danger mb-4">{error.message}</div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary d-flex gap-2 items-center"
        >
          {pending ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                aria-hidden="true"
              />
              <span role="status">Signin in…</span>
            </>
          ) : (
            <>Sign in</>
          )}
        </button>
      </form>
    </div>
  );
}
