import "./Header.css";
import {useState} from "react";

export default function Header () {
const [settingsIsOpen, setSettingsIsOpen] = useState(false);

return (
  <header>
    <button type="button" onClick={() => setSettingsIsOpen(true)}>Settings</button>
    {settingsIsOpen && (
      <div>
        <p>Inställningar</p>
        <button type="button" onClick={() => setSettingsIsOpen(false)}>Stäng</button>
      </div>
    )}
  </header>
)
};
