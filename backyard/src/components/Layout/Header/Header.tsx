import "./Header.css";
import { useState } from "react";
import { Settings } from "lucide-react";

export default function Header() {
  const [settingsIsOpen, setSettingsIsOpen] = useState(false);

  return (
    <header className="header">
      <button
        type="button"
        className="header__settings-btn"
        aria-label="Öppna inställningar"
        onClick={() => setSettingsIsOpen(true)}
      >
        <Settings size={18} />
      </button>

      {settingsIsOpen && (
        <div className="header__modal">
          <p>Inställningar</p>
          <button type="button" onClick={() => setSettingsIsOpen(false)}>
            Stäng
          </button>
        </div>
      )}
    </header>
  );
}

