import "bootstrap/dist/css/bootstrap.css";
import { useActionState, useEffect, useState } from "react";
import { connectMissions, type ManagedMission, type Missions } from "../../src";
import {
  MissionsContextProvider,
  useMissions,
  useMissionsUser,
} from "../../src/react";

export default function App() {
  const [missions, setMissions] = useState<Missions>();

  return missions ? (
    <MissionsContextProvider missions={missions}>
      <Main signOut={() => setMissions(undefined)} />
    </MissionsContextProvider>
  ) : (
    <SignIn setMissions={setMissions} />
  );
}

function Main({ signOut }: { signOut: () => void }) {
  return (
    <div className="container py-4">
      <h1 className="display-3">Missions</h1>
      <div className="mb-2 d-flex justify-content-between align-items-baseline">
        <User />
        <button onClick={signOut} className="btn btn-sm btn-outline-primary">
          sign out
        </button>
      </div>
      <Missions />
    </div>
  );
}

function User() {
  const user = useMissionsUser();

  return user ? (
    <span>
      {[user.displayName, user.email, user.id].filter(Boolean).join(" / ")}
    </span>
  ) : null;
}

function Missions() {
  const missions = useMissions();

  return (
    <ul className="list-group">
      {Object.values(missions)
        .toSorted((a, b) => a.id.localeCompare(b.id))
        .map((mission) => (
          <MissionItem key={mission.id} mission={mission} />
        ))}
    </ul>
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
  setMissions,
}: {
  setMissions: (context?: Missions) => void;
}) {
  const localStorageKey = "rescuetablet:missions-client:demo:apiKey";
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

      const context = await connectMissions({ apiKey });
      localStorage.setItem(localStorageKey, apiKey);
      setMissions(context);
      return undefined;
    } catch (error: any) {
      setMissions(undefined);
      return error;
    }
  }, undefined);

  useEffect(() => {
    const storedApiKey = localStorage.getItem(localStorageKey);
    if (storedApiKey) {
      setApiKey(storedApiKey);
      const form = new FormData();
      form.set("apiKey", storedApiKey);
      submitAction(form);
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
