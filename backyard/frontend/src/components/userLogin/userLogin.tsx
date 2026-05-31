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
    isFormBlocked,
    isSubmitting,
    setIsRegisterMode,
    handleSubmit,
    handleFirstNameChange,
    handleLastNameChange,
    handleClubChange,
    handleWantsOrganizerChange,
    handleOrganizerNameChange,
    handleEmailChange,
    handleConfirmEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  } = useUserLoginForm({ onAuthSuccess });

  return(
    <section className="auth-page">
      <div className="auth-panel">
        <p className="auth-panel__eyebrow">Användarkonto</p>
        <h1>{isRegisterMode ? "Registrera konto" : "Logga in"}</h1>
        <form className="auth-form" onSubmit={handleSubmit}>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">Inloggning lyckades!</div>}

          {isRegisterMode && (
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

          {isRegisterMode && fieldErrors.firstName && <div className="field-error">{fieldErrors.firstName}</div>}
          {isRegisterMode && fieldErrors.lastName && <div className="field-error">{fieldErrors.lastName}</div>}

          {isRegisterMode && (
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

          {isRegisterMode && (
            <label className="auth-form__checkbox">
              <input
                type="checkbox"
                checked={user.wantsOrganizer}
                onChange={e => handleWantsOrganizerChange(e.target.checked)}
              />
              Jag vill även kunna lägga upp tävlingar som arrangör
            </label>
          )}

          {isRegisterMode && user.wantsOrganizer && (
            <label>
              Namn på arrangör
              <input
                type="text"
                placeholder="Trail AB"
                value={user.organizerName}
                onChange={e => handleOrganizerNameChange(e.target.value)}
              />
            </label>
          )}

          {isRegisterMode && fieldErrors.organizerName && <div className="field-error">{fieldErrors.organizerName}</div>}

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
