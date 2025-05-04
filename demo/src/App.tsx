import "bootstrap/dist/css/bootstrap.css";
import { type ManagedMission, type Missions } from "../../src";
import { useMissions, useMissionsUser } from "../../src/react";
import AuthProvider, { useSignOut } from "./auth";

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
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
