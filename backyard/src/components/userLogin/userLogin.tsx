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
  })

  //logik för inloggning
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Kontrollera att e-postfälten matchar
    if (user.email !== user.confirmEmail) {
      setError("E-postadresserna måste stämma överens");
      return;
    }
    if (user.password !== user.confirmPassword) {
      setError("Lösenorden måste stämma överens");
      return;
    }
    // Annan validering kan läggas här
  }


  return(
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>x</button>
      <form onSubmit={handleSubmit}>

      {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder= "användarnamn"
          value={user.userName}
          onChange={e => {
            const value = e.target.value;
            setUser({...user, userName:value});
            if (value.length > 0 && value.length <= 4) {
              //Visa felmeddelande eller nollställ dem
              setError("Användarnamnet måste innehålla minst 5 bokstäver");
            } else {
              setError("");
            }
          }}
        />

        <input
          type="email"
          placeholder= "email"
          value= {user.email}
          onChange= {e => {
            const value = e.target.value;
            setUser({...user, email:value});
            if (/[åäö]/i.test(value)) {
              setError("E-postadressen innehåller felaktiga symboler")
            }
            else if(!value.includes("@")) {
              setError("Emailen måste innehålla @")
            } else {
              setError("");
            }
          }}
        />

        <input
          type="email"
          placeholder="bekräfta email"
          value={user.confirmEmail}
          onChange={e => {
            const value = e.target.value;
            setUser({ ...user, confirmEmail: value });
            if (user.email && value !== user.email) {
              setError("E-postadresserna måste stämma överens");
            } else {
              setError("");
            }
          }}
        />

        <input
          type="password"
          placeholder= "lösenord"
          value = {user.password}
          onChange= {e => {
            const value = e.target.value;
            setUser({...user, password: value});
              if (value.length<=7) {
                setError("Lösenordet behöver ha minst 8 tecken")
                } else {
                  setError("");
                }
              }}
        />

        <input
          type="password"
          placeholder= "bekräfta lösenordet"
          value = {user.confirmPassword}
          onChange= {e => {
            const value = e.target.value;
            setUser({...user, confirmPassword: value});
              if (user.password && value !== user.password ) {
                setError("Lösenorden behöver stämma överens")
                } else {
                  setError("");
                }
              }}
        />

        <button type="submit">Registrera</button>


      </form>
    </div>
    );
  };
