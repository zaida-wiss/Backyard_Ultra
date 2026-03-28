import "./Header.css";
import { useState } from "react";
import { UserLock } from "lucide-react";
import {UserLogin} from "../../userLogin/userLogin";


export default function Header() {
  const [loginIsOpen, setLoginIsOpen] = useState(false);

  return (
    <header className="header">
      <button
        type="button"
        className="header__user-lock"
        aria-label="Logga in"
        onClick={() => setLoginIsOpen(true)}
      >
        <UserLock size={18} />
      </button>
      {loginIsOpen && (
        <div className="modal-overlay">
          <UserLogin onClose= {() => setLoginIsOpen(false)}/>
        </div>
      )}
    </header>
  );
}

