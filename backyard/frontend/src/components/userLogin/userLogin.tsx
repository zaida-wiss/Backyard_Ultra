import { useUserLoginForm } from "./useUserLoginForm";
import "./userLogin.css";


type UserLoginProps = {
  onClose: () => void;
};
export function UserLogin ({onClose}: UserLoginProps) {
  const {
    user,
    error,
    success,
    fieldErrors,
    isRegisterMode,
    isFormBlocked,
    setIsRegisterMode,
    handleSubmit,
    handleUserNameChange,
    handleEmailChange,
    handleConfirmEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  } = useUserLoginForm();

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
          onChange={e => handleUserNameChange(e.target.value)}
        />

        {fieldErrors.userName && <div className="field-error">{fieldErrors.userName}</div>}

        <input
          type="email"
          placeholder= "email"
          value= {user.email}
          onChange= {e => handleEmailChange(e.target.value)}
        />

        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}

        <input
          type="email"
          placeholder="email (bekräfta)"
          value={user.confirmEmail}
          onChange={e => handleConfirmEmailChange(e.target.value)}
        />

        {fieldErrors.confirmEmail && <div className="field-error">{fieldErrors.confirmEmail}</div>}

        <input
          type="password"
          placeholder="lösenord"
          value={user.password}
          onChange={e => handlePasswordChange(e.target.value)}
        />

        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}

        <input
          type="password"
          placeholder= "lösenord (bekräfta)"
          value = {user.confirmPassword}
          onChange= {e => handleConfirmPasswordChange(e.target.value)}
        />

        {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}

        <button type="submit" disabled={isFormBlocked}>
          {isRegisterMode ? "Registrera" : "Logga in"}
        </button>

        <button
          type= "button"
          className="toggle-mode-btn"
          disabled={isFormBlocked}
          onClick={() => setIsRegisterMode(mode => !mode)}
        >
          {isRegisterMode ? "Har du redan ett konto? Logga in" : "Inget konto? Registrera konto"}
        </button>


      </form>
    </div>
  );
}
