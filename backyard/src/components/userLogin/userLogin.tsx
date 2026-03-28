import {useState} from "react";


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

    if (user.userName.length <=4) {
      //Visa felmeddelande eller returnera
      setError("användarnamnet måste innehålla minst 5 bokstäver")
      return;
    }

    if (!user.email.includes("@")) {
      setError("emailen måste innehålla @")
      return;
    }
    if (/[åäö]/i.test(user.email)) {
      setError("E-postadressen innehåller felaktiga symboler")
      return;
    }

    if (user.password.length<=7) {
      setError("Lösenordet behöver ha minst 2 tecken")
      return;
    }
    setError(""); // Nollställ fel om allt är ok
  }

  return(
    <div className="modal-content">
      <form onSubmit={handleSubmit}>

      {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder= "username"
          value={user.userName}
          onChange={e =>setUser({
          ...user, userName:e.target.value})}
        />

        <input
          type="email"
          placeholder= "email"
          value= {user.email}
          onChange= {e => setUser({
            ...user, email:e.target.value})}
          />

        <input
          type="password"
          placeholder= "password"
          value = {user.password}
          onChange= {e => setUser({
            ...user, password: e.target.value})}
          />

          <button type="submit">Logga in</button>

      </form>
      <button onClick={onClose}>x</button>
    </div>
    );
}
