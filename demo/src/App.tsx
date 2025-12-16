import "bootstrap/dist/css/bootstrap.css";
import { useState } from "react";
import { type ManagedMission } from "../../src";
import { createMissionsManager } from "../../src/browser";
import {
  MissionsContextProvider,
  useMissions,
  useMissionsUser,
} from "../../src/react";
import AuthProvider, { useSignOut } from "./auth";

const manager = createMissionsManager();

export default function App() {
  return (
    <MissionsContextProvider manager={manager}>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </MissionsContextProvider>
  );
}

function Main() {
  const signOut = useSignOut();

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

  return Object.keys(missions).length ? (
    <div className="accordion">
      {Object.values(missions)
        .toSorted((a, b) => a.id.localeCompare(b.id))
        .map((mission) => (
          <MissionItem key={mission.id} mission={mission} />
        ))}
    </div>
  ) : (
    <div className="alert alert-info">No missions</div>
  );
}

function MissionItem({ mission }: { mission: ManagedMission }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="accordion-item">
      {mission.state === "loading" && (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      )}
      {mission.state === "error" && (
        <div className="alert alert-danger">{mission.error.message}</div>
      )}
      {mission.state === "ready" && (
        <>
          <h2 className="accordion-header">
            <button
              className={`accordion-button ${open ? "" : "collapsed"}`}
              type="button"
              onClick={() => setOpen((o) => !o)}
            >
              {mission.mission.keyword ? (
                <span className="badge text-bg-primary me-1">
                  {mission.mission.keyword}
                </span>
              ) : null}
              {mission.mission.message}
            </button>
          </h2>
          <div
            className={`accordion-collapse collapse ${open ? "show" : ""} p-4`}
          >
            <pre>{JSON.stringify(mission.mission, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}
