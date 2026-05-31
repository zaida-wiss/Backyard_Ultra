import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Trophy,
  User,
} from "lucide-react";
import { useUserLoginForm } from "./useUserLoginForm";
import "./userLogin.css";
import { listCompetitions } from "../../services/api";
import type { Competition } from "../../types/types";


type UserLoginProps = {
  onAuthSuccess: () => void | Promise<void>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UserLogin ({onAuthSuccess}: UserLoginProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [competitionError, setCompetitionError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
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
    handleEmailChange,
    handleConfirmEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  } = useUserLoginForm({ onAuthSuccess });

  useEffect(() => {
    listCompetitions()
      .then(setCompetitions)
      .catch((err: unknown) => {
        setCompetitionError(err instanceof Error ? err.message : "Kunde inte hämta tävlingar");
      });
  }, []);

  const competitionTypes = useMemo(() => {
    return [...new Set(competitions.map((competition) => competition.type).filter(Boolean))].sort();
  }, [competitions]);

  const competitionPlaces = useMemo(() => {
    return [...new Set(competitions.map((competition) => competition.place).filter(Boolean))].sort();
  }, [competitions]);

  const filteredCompetitions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return competitions.filter((competition) => {
      const matchesSearch = !normalizedSearch
        || competition.name.toLowerCase().includes(normalizedSearch)
        || competition.type.toLowerCase().includes(normalizedSearch)
        || competition.place.toLowerCase().includes(normalizedSearch);
      const matchesType = !selectedType || competition.type === selectedType;
      const matchesPlace = !selectedPlace || competition.place === selectedPlace;

      return matchesSearch && matchesType && matchesPlace;
    });
  }, [competitions, searchTerm, selectedPlace, selectedType]);

  const setMode = (nextMode: boolean) => {
    if (!isFormBlocked) {
      setIsRegisterMode(nextMode);
    }
  };

  return(
    <section className="auth-page">
      <div className="auth-page__noise" />
      <div className="auth-page__orb auth-page__orb--a" />
      <div className="auth-page__orb auth-page__orb--b" />
      <div className="auth-page__orb auth-page__orb--c" />

      <div className="auth-intro auth-intro--catalog">
        <p className="auth-intro__eyebrow">Tävlingsplattform</p>
        <h1>
          Alla<br />
          <span>tävlingar.</span><br />
          Ett konto.
        </h1>
        <p>
          Utforska tävlingar inom flera sporter. Logga in när du vill arrangera, administrera eller anmäla dig.
        </p>

        <div className="public-competition-filters" aria-label="Filtrera tävlingar">
          <input
            type="search"
            placeholder="Sök sport, plats eller tävling"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <div>
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
            >
              <option value="">Alla sporter</option>
              {competitionTypes.map((type) => (
                <option value={type} key={type}>{type}</option>
              ))}
            </select>
            <select
              value={selectedPlace}
              onChange={(event) => setSelectedPlace(event.target.value)}
            >
              <option value="">Alla platser</option>
              {competitionPlaces.map((place) => (
                <option value={place} key={place}>{place}</option>
              ))}
            </select>
          </div>
        </div>

        {competitionError && <div className="error">{competitionError}</div>}

        <div className="public-competition-list" aria-label="Publika tävlingar">
          {filteredCompetitions.length === 0 ? (
            <p className="public-competition-list__empty">Inga tävlingar matchar filtret ännu.</p>
          ) : (
            filteredCompetitions.slice(0, 4).map((competition) => (
              <article className="public-competition-card" key={competition.id}>
                <div>
                  <span>{competition.type}</span>
                  <h2>{competition.name}</h2>
                </div>
                <p>
                  <MapPin size={14} />
                  {competition.place}
                </p>
                <p>
                  <Trophy size={14} />
                  {formatDateTime(competition.startAt)}
                </p>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="auth-rule" />

      <div className="auth-panel">
        {success && (
          <div className="auth-success-overlay">
            <div className="auth-success-overlay__ring">
              <Check size={30} />
            </div>
            <strong>Inloggad</strong>
            <span>// REDIRECTING TO DASHBOARD</span>
          </div>
        )}

        <p className="auth-panel__eyebrow">
          <span />
          {isRegisterMode ? "Skapa användarkonto" : "Användarkonto"}
        </p>
        <h2>{isRegisterMode ? "Registrera konto" : "Logga in"}</h2>

        <div className="auth-mode-tabs" aria-label="Välj inloggningsläge">
          <button
            type="button"
            className={!isRegisterMode ? "is-active" : ""}
            onClick={() => setMode(false)}
          >
            Logga in
          </button>
          <button
            type="button"
            className={isRegisterMode ? "is-active" : ""}
            onClick={() => setMode(true)}
          >
            Registrera
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          {error && <div className="error">{error}</div>}

          {isRegisterMode && (
            <div className="auth-form__grid">
              <div className="auth-field">
                <label htmlFor="firstName">Förnamn</label>
                <div className="auth-field__control">
                  <User className={focusedField === "firstName" ? "is-focused" : ""} size={16} />
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Erik"
                    value={user.firstName}
                    autoFocus
                    onChange={e => handleFirstNameChange(e.target.value)}
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="lastName">Efternamn</label>
                <div className="auth-field__control">
                  <User className={focusedField === "lastName" ? "is-focused" : ""} size={16} />
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Marklund"
                    value={user.lastName}
                    onChange={e => handleLastNameChange(e.target.value)}
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>
            </div>
          )}

          {isRegisterMode && fieldErrors.firstName && <div className="field-error">{fieldErrors.firstName}</div>}
          {isRegisterMode && fieldErrors.lastName && <div className="field-error">{fieldErrors.lastName}</div>}

          {isRegisterMode && (
            <div className="auth-field">
              <label htmlFor="club">Klubb</label>
              <div className="auth-field__control">
                <Building2 className={focusedField === "club" ? "is-focused" : ""} size={16} />
                <input
                  id="club"
                  type="text"
                  placeholder="Trailklubben"
                  value={user.club}
                  onChange={e => handleClubChange(e.target.value)}
                  onFocus={() => setFocusedField("club")}
                  onBlur={() => setFocusedField("")}
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <div className="auth-field__control">
              <Mail className={focusedField === "email" ? "is-focused" : ""} size={16} />
              <input
                id="email"
                type="email"
                placeholder= "namn@example.com"
                value= {user.email}
                autoFocus={!isRegisterMode}
                onChange= {e => handleEmailChange(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>

          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}

          {isRegisterMode && (
            <div className="auth-field">
              <label htmlFor="confirmEmail">Bekräfta email</label>
              <div className="auth-field__control">
                <Mail className={focusedField === "confirmEmail" ? "is-focused" : ""} size={16} />
                <input
                  id="confirmEmail"
                  type="email"
                  placeholder="arrangor@example.com"
                  value={user.confirmEmail}
                  onChange={e => handleConfirmEmailChange(e.target.value)}
                  onFocus={() => setFocusedField("confirmEmail")}
                  onBlur={() => setFocusedField("")}
                />
              </div>
            </div>
          )}

          {isRegisterMode && fieldErrors.confirmEmail && <div className="field-error">{fieldErrors.confirmEmail}</div>}

          <div className="auth-field">
            <label htmlFor="password">Lösenord</label>
            <div className="auth-field__control">
              <Lock className={focusedField === "password" ? "is-focused" : ""} size={16} />
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="minst 8 tecken"
                value={user.password}
                onChange={e => handlePasswordChange(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
              />
              <button
                type="button"
                className="auth-field__icon-button"
                aria-label={isPasswordVisible ? "Dölj lösenord" : "Visa lösenord"}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}

          {isRegisterMode && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">Bekräfta lösenord</label>
              <div className="auth-field__control">
                <Lock className={focusedField === "confirmPassword" ? "is-focused" : ""} size={16} />
                <input
                  id="confirmPassword"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  placeholder= "samma lösenord igen"
                  value = {user.confirmPassword}
                  onChange= {e => handleConfirmPasswordChange(e.target.value)}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField("")}
                />
                <button
                  type="button"
                  className="auth-field__icon-button"
                  aria-label={isConfirmPasswordVisible ? "Dölj lösenord" : "Visa lösenord"}
                  onClick={() => setIsConfirmPasswordVisible((visible) => !visible)}
                >
                  {isConfirmPasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {isRegisterMode && fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}

          <button type="submit" disabled={isFormBlocked}>
            {isSubmitting ? "Skickar..." : isRegisterMode ? "Registrera" : "Logga in"}
          </button>

        </form>

        <div className="auth-foot">
          {isRegisterMode ? "Har du redan ett konto?" : "Inget konto?"}{" "}
          <button
            type= "button"
            disabled={isFormBlocked}
            onClick={() => setMode(!isRegisterMode)}
          >
            {isRegisterMode ? "Logga in" : "Registrera dig"}
          </button>
        </div>
      </div>
    </section>
  );
}
