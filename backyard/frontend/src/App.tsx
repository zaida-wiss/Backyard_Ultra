import AccountDashboard from "./components/AccountDashboard/AccountDashboard";
import Header from "./components/Layout/Header/Header";
import './App.css';
import { UserLogin } from "./components/userLogin/userLogin";
import { useEffect, useState } from "react";
import { getCurrentSession, logoutUser } from "./services/api";
import type { AuthResponse } from "./types/types";

export default function App() {
  // UI-cache: själva inloggningen ligger i HttpOnly-cookie och läses via /auth/me.
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    getCurrentSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setIsLoadingSession(false));
  }, []);

  async function refreshSession() {
    const currentSession = await getCurrentSession();
    setSession(currentSession);
  }

  function handleLogout() {
    void logoutUser().finally(() => {
      setSession(null);
    });
  }

  if (isLoadingSession) {
    return <Header session={session} onLogout={handleLogout}/>;
  }

  if (!session) {
    return (
      <>
        <Header session={session} onLogout={handleLogout}/>
        <UserLogin onAuthSuccess={refreshSession}/>
      </>
    );
  }

  return (
    <>
      <Header session={session} onLogout={handleLogout}/>
      <AccountDashboard session={session} onAuthUpdate={refreshSession} />
    </>
  );
}
