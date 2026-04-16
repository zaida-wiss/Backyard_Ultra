import "./Header.css";
import { UserLock } from "lucide-react";
type HeaderProps = {
  onLoginClick: () => void;
};


export default function Header({ onLoginClick }: HeaderProps) {

  return (
    <header className="header">
      <button
        type="button"
        className="header__user-lock"
        aria-label="Logga in"
        onClick={onLoginClick}
      >
        <UserLock size={18} />
      </button>
    </header>
  );
}

