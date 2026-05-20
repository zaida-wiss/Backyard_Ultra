import "./Header.css";
import { LogOut, UserLock } from "lucide-react";
import type { AuthResponse } from "../../../types/types";

type HeaderProps = {
  session: AuthResponse | null;
  onLogout: () => void;
};


export default function Header({ session, onLogout }: HeaderProps) {
  const displayName = session?.role === "organizer"
    ? session.organizer.name
    : session
      ? `${session.runner.firstName} ${session.runner.lastName}`
      : "";

  return (
    <header className="header">
      <div className="header__brand">Backyard Ultra</div>

      {session ? (
        <div className="header__session">
          <span>{displayName}</span>
          <button
            type="button"
            className="header__icon-button"
            aria-label="Logga ut"
            title="Logga ut"
            onClick={onLogout}
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <div className="header__session">
          <UserLock size={18} />
          <span>Logga in</span>
        </div>
      )}
    </header>
  );
}
