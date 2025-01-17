import "bootstrap/dist/css/bootstrap.css";
import { useActionState, useState } from "react";
import {
  connectMissions,
  createMissionsClient,
  defaultFirebaseAdapter,
  ManagedMission,
  MissionsContext,
  MissionsContextProvider,
  MissionsManager,
  useMissions,
  useMissionsContext,
} from "../../src";

export default function App() {
  const [context, setContext] = useState<MissionsContext>();

  return context ? (
    <MissionsContextProvider {...context}>
      <Main signOut={() => setContext(undefined)} />
    </MissionsContextProvider>
  ) : (
    <SignIn setContext={setContext} />
  );
}

function Main({ signOut }: { signOut: () => void }) {
  const { user } = useMissionsContext();
  const missions = useMissions();

  return (
    <div className="container py-4">
      <h1 className="display-3">Missions</h1>
      <div className="mb-2 d-flex justify-content-between align-items-baseline">
        <span>{user.displayName ?? user.email ?? user.id}</span>
        <button onClick={signOut} className="btn btn-sm btn-outline-primary">
          sign out
        </button>
      </div>
      <ul className="list-group">
        {Object.values(missions).map((mission) => (
          <MissionItem key={mission.id} mission={mission} />
        ))}
      </ul>
    </div>
  );
}

function MissionItem({ mission }: { mission: ManagedMission }) {
  return (
    <li className="list-group-item">
      {mission.state === "loading" && (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      )}
      {mission.state === "error" && (
        <div className="alert alert-danger">{mission.error.message}</div>
      )}
      {mission.state === "ready" && (
        <span>
          {mission.mission.keyword ? (
            <span className="badge text-bg-primary me-1">
              {mission.mission.keyword}
            </span>
          ) : null}
          {mission.mission.message}
        </span>
      )}
    </li>
  );
}

function SignIn({
  setContext,
}: {
  setContext: (context?: MissionsContext) => void;
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

      const client = createMissionsClient({ apiKey });
      const { user, firebase } = await connectMissions({ client });
      const manager = new MissionsManager({
        firebase: defaultFirebaseAdapter(firebase),
        user,
      });

      setContext({ client, manager, user });

      return undefined;
    } catch (error: any) {
      setContext();
      return error;
    }
  }, undefined);

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
        <button type="submit" disabled={pending} className="btn btn-primary">
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
