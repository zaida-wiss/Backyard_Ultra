import Dashboard from "./components/Dashboard/Dashboard";
import Header from "./components/Layout/Header/Header";
import RunnerDashboard from "./components/RunnerDashboard/RunnerDashboard";
import './App.css';
import { UserLogin } from "./components/userLogin/userLogin";
import {useState} from "react";
import type { AuthResponse, Organizer, RunnerAccount } from "./types/types";

type ActiveView = "runner" | "organizer";

function hasOrganizerRole(session: AuthResponse) {
  return session.user.roles.includes("organizer") || session.user.roles.includes("admin");
}

function getRunnerFromSession(session: AuthResponse): RunnerAccount {
  return session.runner ?? {
    id: session.user.id,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    email: session.user.email,
    club: session.user.club,
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  };
}

function getOrganizerFromSession(session: AuthResponse): Organizer {
  return session.organizer ?? {
    id: session.user.id,
    name: session.user.organizerName ?? `${session.user.firstName} ${session.user.lastName}`,
    email: session.user.email,
    role: session.user.roles.includes("admin") ? "admin" : "organizer",
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  };
}

export default function App() {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("runner");

  function handleAuthSuccess(auth: AuthResponse) {
    setSession(auth);
    setToken(auth.token);
    setActiveView(hasOrganizerRole(auth) ? "organizer" : "runner");
  }

  function handleLogout() {
    setSession(null);
    setToken("");
    setActiveView("runner");
  }

  if (!session || !token) {
    return (
      <>
        <Header session={session} onLogout={handleLogout}/>
        <UserLogin onAuthSuccess={handleAuthSuccess}/>
      </>
    );
  }

  const canOpenRunnerView = session.user.roles.includes("runner");
  const canOpenOrganizerView = hasOrganizerRole(session);

  return (
    <>
      <Header session={session} onLogout={handleLogout}/>
      {canOpenRunnerView && canOpenOrganizerView && (
        <nav className="app-view-toggle" aria-label="Välj arbetsyta">
          <button
            type="button"
            className={activeView === "runner" ? "is-active" : ""}
            onClick={() => setActiveView("runner")}
          >
            Löpare
          </button>
          <button
            type="button"
            className={activeView === "organizer" ? "is-active" : ""}
            onClick={() => setActiveView("organizer")}
          >
            Arrangör
          </button>
        </nav>
      )}
      {activeView === "organizer" && canOpenOrganizerView ? (
        <Dashboard organizer={getOrganizerFromSession(session)} token={token} />
      ) : canOpenRunnerView ? (
        <RunnerDashboard runner={getRunnerFromSession(session)} token={token} />
      ) : (
        <main className="app-empty-state">
          <h1>Kontot saknar arbetsyta</h1>
          <p>Be en admin lägga till rätt behörighet.</p>
        </main>
      )}
    </>
  );
}
