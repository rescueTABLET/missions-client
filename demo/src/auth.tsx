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
import { useMissionsContext } from "../../src/react";

type AuthContext = {
  signOut: () => void;
};

const Context = createContext<AuthContext>({ signOut: () => {} });

const localStorageKey = "rescuetablet:missions-client:demo:apiKey";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const { manager } = useMissionsContext();

  const signIn = useCallback(
    async (apiKey: string) => {
      try {
        await manager.authorize(apiKey);
        setAuthorized(true);
      } catch (error) {
        setAuthorized(false);
        throw error;
      }
    },
    [manager]
  );

  const signOut = useCallback(async () => {
    await manager.deauthorize();
    setAuthorized(false);
    localStorage.removeItem(localStorageKey);
  }, [manager]);

  return authorized ? (
    <Context value={{ signOut }}>{children}</Context>
  ) : (
    <SignIn signIn={signIn} />
  );
}

export function useSignOut(): () => void {
  return useContext(Context).signOut;
}

function SignIn({ signIn }: { signIn: (apiKey: string) => Promise<void> }) {
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

      await signIn(apiKey);
      localStorage.setItem(localStorageKey, apiKey);
      return undefined;
    } catch (error: any) {
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
