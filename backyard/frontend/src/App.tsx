import Dashboard from "./components/Dashboard/Dashboard";
import Header from "./components/Layout/Header/Header";
import RunnerDashboard from "./components/RunnerDashboard/RunnerDashboard";
import './App.css';
import { UserLogin } from "./components/userLogin/userLogin";
import {useState} from "react";
import type { AuthResponse } from "./types/types";



export default function App() {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState("");

  function handleAuthSuccess(auth: AuthResponse) {
    setSession(auth);
    setToken(auth.token);
  }

  function handleLogout() {
    setSession(null);
    setToken("");
  }


  return (
    <>
      <Header session={session} onLogout={handleLogout}/>
      {session?.role === "organizer" && token ? (
        <Dashboard organizer={session.organizer} token={token} />
      ) : session?.role === "runner" && token ? (
        <RunnerDashboard runner={session.runner} token={token} />
      ) : (
        <UserLogin onAuthSuccess={handleAuthSuccess}/>
      )}
    </>
  );
}
