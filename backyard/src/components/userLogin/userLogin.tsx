import {useState} from "react";
import "./userLogin.css";


type UserLoginProps = {
  onClose: () => void;
};

type UserData = {
  userName: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
};

export function UserLogin ({onClose}: UserLoginProps) {
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserData>({
    userName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: ""
   });
  const [fieldErrors, setFieldErrors] = useState({
    userName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: ""
  });
  const [success, setSuccess] = useState(false);

  //logik för inloggning
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Om något fält har felmeddelande, stoppa submit
    if (Object.values(fieldErrors).some(msg => msg)) {
      setError("Korrigera fälten ovan.");
      setSuccess(false);
      return;
    }
    setError("");
    setSuccess(true);
    // Här kan du lägga till logik för att skicka data till backend
  }


  return(
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>x</button>
      <form onSubmit={handleSubmit}>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Registrering lyckades!</div>}

        <input
          type="text"
          placeholder= "användarnamn"
          value={user.userName}
          autoFocus
          onChange={e => {
            const value = e.target.value;
            setUser({ ...user, userName: value });
            setFieldErrors(f => ({ ...f, userName: value.length > 0 && value.length <= 4 ? "Användarnamnet måste innehålla minst 5 bokstäver" : "" }));
          }}
        />

        {fieldErrors.userName && <div className="field-error">{fieldErrors.userName}</div>}

        <input
          type="email"
          placeholder= "email"
          value= {user.email}
          onChange= {e => {
            const value = e.target.value;
            setUser({...user, email:value});
            let msg = "";
            if (/[åäö]/i.test(value)) {
              msg = "E-postadressen innehåller felaktiga symboler";
            } else if (!value.includes("@")) {
              msg = "Emailen måste innehålla @";
            }
            setFieldErrors(f => ({ ...f, email: msg }));
          }}
        />

        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}

        <input
          type="email"
          placeholder="bekräfta email"
          value={user.confirmEmail}
          onChange={e => {
            const value = e.target.value;
            setUser({ ...user, confirmEmail: value });
            setFieldErrors(f => ({ ...f, confirmEmail: user.email && value !== user.email ? "E-postadresserna måste stämma överens" : "" }));
          }}
        />

        {fieldErrors.confirmEmail && <div className="field-error">{fieldErrors.confirmEmail}</div>}

        <input
          type="password"
          placeholder="lösenord"
          value={user.password}
          onChange={e => {
            const value = e.target.value;
           setUser({ ...user, password: value });
            setFieldErrors(f => ({ ...f, password: value.length <= 7 ? "Lösenordet behöver ha minst 8 tecken" : "" }));
          }}
        />
    
        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}

        <input
          type="password"
          placeholder= "bekräfta lösenordet"
          value = {user.confirmPassword}
          onChange= {e => {
            const value = e.target.value;
            setUser({ ...user, confirmPassword: value });
            setFieldErrors(f => ({ ...f, confirmPassword: user.password && value !== user.password ? "Lösenorden behöver stämma överens" : "" }));
          }}
        />

        {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}

         <button type="submit" disabled={!!error || Object.values(fieldErrors).some(msg => msg)}>Registrera</button>


      </form>
    </div>
    );
  };
