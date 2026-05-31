import "./Header.css";
import { LogOut, Settings } from "lucide-react";
import type { AuthResponse } from "../../../types/types";

type HeaderProps = {
  session: AuthResponse | null;
  onLogout: () => void;
};


export default function Header({ session, onLogout }: HeaderProps) {
  const displayName = session
    ? `${session.user.firstName} ${session.user.lastName}`
    : "";

  return (
    <header className="header">
      <div className="header__brand">Backyard Ultra</div>

      {session ? (
        <div className="header__session">
          <div className="header__welcome">
            <small>Välkommen</small>
            <span>{displayName}</span>
          </div>
          <button
            type="button"
            className="header__settings-button"
            aria-label="Inställningar"
            title="Inställningar"
          >
            <Settings size={22} />
          </button>
          <button
            type="button"
            className="header__logout-button"
            aria-label="Logga ut"
            title="Logga ut"
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Logga ut</span>
          </button>
        </div>
      ) : (
        <div className="header__session">
          <span className="header__status-dot" />
          <span>System online</span>
        </div>
      )}
    </header>
  );
}
