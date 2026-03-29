import {useState} from "react";
import "./userLogin.css";


type UserLoginProps = {
  onClose: () => void;
};

type UserData = {
  userName: string;
  email: string;
  password: string;
};

export function UserLogin ({onClose}: UserLoginProps) {
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserData>({
    userName: "",
    email: "",
    password: ""
  })

  //logik för inloggning
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }


  return(
      <div className="modal-content">
      <form onSubmit={handleSubmit}>

      {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder= "username"
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
          type="password"
          placeholder= "password"
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

        <button type="submit">Logga in</button>

      </form>
      <button onClick={onClose}>x</button>
    </div>
    );
  };
