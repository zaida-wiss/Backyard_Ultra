import { useUserLoginForm } from "./useUserLoginForm";
import "./userLogin.css";
import type { AuthResponse } from "../../types/types";


type UserLoginProps = {
  onAuthSuccess: (auth: AuthResponse) => void;
};
export function UserLogin ({onAuthSuccess}: UserLoginProps) {
  const {
    user,
    error,
    success,
    fieldErrors,
    isRegisterMode,
    authRole,
    isFormBlocked,
    isSubmitting,
    setIsRegisterMode,
    setAuthRole,
    handleSubmit,
    handleUserNameChange,
    handleFirstNameChange,
    handleLastNameChange,
    handleClubChange,
    handleEmailChange,
    handleConfirmEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  } = useUserLoginForm({ onAuthSuccess });

  return(
    <section className="auth-page">
      <div className="auth-panel">
        <p className="auth-panel__eyebrow">{authRole === "organizer" ? "Arrangörskonto" : "Löparkonto"}</p>
        <h1>{isRegisterMode ? "Registrera konto" : "Logga in"}</h1>
        <div className="auth-role-toggle" aria-label="Välj kontotyp">
          <button
            type="button"
            className={authRole === "organizer" ? "auth-role-toggle__button is-active" : "auth-role-toggle__button"}
            onClick={() => setAuthRole("organizer")}
          >
            Arrangör
          </button>
          <button
            type="button"
            className={authRole === "runner" ? "auth-role-toggle__button is-active" : "auth-role-toggle__button"}
            onClick={() => setAuthRole("runner")}
          >
            Löpare
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">Inloggning lyckades!</div>}

          {isRegisterMode && authRole === "organizer" && (
            <label>
              Namn på arrangör
              <input
                type="text"
                placeholder= "Trail AB"
                value={user.userName}
                autoFocus
                onChange={e => handleUserNameChange(e.target.value)}
              />
            </label>
          )}

          {isRegisterMode && authRole === "organizer" && fieldErrors.userName && <div className="field-error">{fieldErrors.userName}</div>}

          {isRegisterMode && authRole === "runner" && (
            <div className="auth-form__grid">
              <label>
                Förnamn
                <input
                  type="text"
                  placeholder="Erik"
                  value={user.firstName}
                  autoFocus
                  onChange={e => handleFirstNameChange(e.target.value)}
                />
              </label>
              <label>
                Efternamn
                <input
                  type="text"
                  placeholder="Marklund"
                  value={user.lastName}
                  onChange={e => handleLastNameChange(e.target.value)}
                />
              </label>
            </div>
          )}

          {isRegisterMode && authRole === "runner" && fieldErrors.firstName && <div className="field-error">{fieldErrors.firstName}</div>}
          {isRegisterMode && authRole === "runner" && fieldErrors.lastName && <div className="field-error">{fieldErrors.lastName}</div>}

          {isRegisterMode && authRole === "runner" && (
            <label>
              Klubb
              <input
                type="text"
                placeholder="Trailklubben"
                value={user.club}
                onChange={e => handleClubChange(e.target.value)}
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              placeholder= "arrangor@example.com"
              value= {user.email}
              autoFocus={!isRegisterMode}
              onChange= {e => handleEmailChange(e.target.value)}
            />
          </label>

          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}

          {isRegisterMode && (
            <label>
              Bekräfta email
              <input
                type="email"
                placeholder="arrangor@example.com"
                value={user.confirmEmail}
                onChange={e => handleConfirmEmailChange(e.target.value)}
              />
            </label>
          )}

          {isRegisterMode && fieldErrors.confirmEmail && <div className="field-error">{fieldErrors.confirmEmail}</div>}

          <label>
            Lösenord
            <input
              type="password"
              placeholder="minst 8 tecken"
              value={user.password}
              onChange={e => handlePasswordChange(e.target.value)}
            />
          </label>

          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}

          {isRegisterMode && (
            <label>
              Bekräfta lösenord
              <input
                type="password"
                placeholder= "samma lösenord igen"
                value = {user.confirmPassword}
                onChange= {e => handleConfirmPasswordChange(e.target.value)}
              />
            </label>
          )}

          {isRegisterMode && fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}

          <button type="submit" disabled={isFormBlocked}>
            {isSubmitting ? "Skickar..." : isRegisterMode ? "Registrera" : "Logga in"}
          </button>

          <button
            type= "button"
            className="toggle-mode-btn"
            disabled={isFormBlocked}
            onClick={() => setIsRegisterMode(!isRegisterMode)}
          >
            {isRegisterMode ? "Har du redan ett konto? Logga in" : "Inget konto? Registrera konto"}
          </button>


        </form>
      </div>
    </section>
  );
}
