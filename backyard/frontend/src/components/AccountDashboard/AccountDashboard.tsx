import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MapPin, Timer, Trophy, User } from "lucide-react";
import {
  becomeOrganizer,
  becomeTimekeeper,
  createCompetition,
  downloadMyData,
  hardDeleteMyAccount,
  listCompetitionRunners,
  listCompetitions,
  listRunnerRegistrations,
  reportRunnerLapTimes,
  softDeleteMyAccount,
} from "../../services/api";
import type {
  AuthResponse,
  Competition,
  CreateCompetitionData,
  RunnerRegistration,
  RunnerRegistrationWithCompetition,
} from "../../types/types";
import "./AccountDashboard.css";

type AccountDashboardProps = {
  session: AuthResponse;
  onAuthUpdate: () => void | Promise<void>;
};

type UpcomingItem = {
  id: string;
  role: "runner" | "timekeeper";
  competition: Competition;
};

type ActiveRoleView = "runner" | "organizer" | "timekeeper";
type TimingSort = "runnerNumber" | "averageLapTime";

const BACKYARD_LAP_KM = 6.706;
const BACKYARD_LAP_SECONDS = 60 * 60;

const initialCompetitionForm: CreateCompetitionData = {
  name: "",
  type: "",
  place: "",
  startAt: "",
  endAt: null,
};

function hasOrganizerRole(session: AuthResponse) {
  return session.user.roles.includes("organizer") || session.user.roles.includes("admin");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function isUpcoming(competition: Competition) {
  return new Date(competition.startAt).getTime() >= Date.now();
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function calculateAverageLapTime(lapTimes: number[]) {
  if (lapTimes.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return lapTimes.reduce((sum, lapTime) => sum + lapTime, 0) / lapTimes.length;
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getCurrentLapElapsedSeconds(competition: Competition) {
  const elapsedSeconds = Math.floor(
    (Date.now() - new Date(competition.startAt).getTime()) / 1000,
  );

  if (elapsedSeconds < 0) {
    throw new Error("Tävlingen har inte startat ännu.");
  }

  return Math.min(BACKYARD_LAP_SECONDS - 1, elapsedSeconds % BACKYARD_LAP_SECONDS);
}

function getCurrentRaceLapNumber(competition: Competition) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(competition.startAt).getTime()) / 1000),
  );

  return Math.floor(elapsedSeconds / BACKYARD_LAP_SECONDS) + 1;
}

function getRunnerInfo(runner: RunnerRegistration) {
  const parts = [
    runner.club ? `Springer för: ${runner.club}` : null,
    runner.teamName ? `Lag: ${runner.teamName}` : null,
    runner.teamMembers.length > 0
      ? `Lagmedlemmar: ${runner.teamMembers
        .map((member) => `${member.firstName} ${member.lastName}`)
        .join(", ")}`
      : null,
  ].filter(Boolean);

  return parts.join(" · ") || "Ingen extra deltagarinformation";
}

export default function AccountDashboard({
  session,
  onAuthUpdate,
}: AccountDashboardProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [registrations, setRegistrations] = useState<RunnerRegistrationWithCompetition[]>([]);
  const [activeRoleView, setActiveRoleView] = useState<ActiveRoleView>("runner");
  const [competitionForm, setCompetitionForm] = useState<CreateCompetitionData>(initialCompetitionForm);
  const [activeTimingCompetition, setActiveTimingCompetition] = useState<Competition | null>(null);
  const [timingRunners, setTimingRunners] = useState<RunnerRegistration[]>([]);
  const [lapTimeDrafts, setLapTimeDrafts] = useState<Record<string, string>>({});
  const [timingSort, setTimingSort] = useState<TimingSort>("runnerNumber");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isCreatingCompetition, setIsCreatingCompetition] = useState(false);
  const [isLoadingTimingRunners, setIsLoadingTimingRunners] = useState(false);
  const [isReportingRunnerId, setIsReportingRunnerId] = useState<string | null>(null);

  const canOrganize = hasOrganizerRole(session);
  const canJoin = session.user.roles.includes("runner");
  const canReportTimes = session.user.roles.includes("timekeeper");
  const displayName = `${session.user.firstName} ${session.user.lastName}`;
  const organizerCompetitions = useMemo(() => {
    const organizerId = session.organizer?.id ?? session.user.id;

    return competitions.filter((competition) => competition.organizerId === organizerId);
  }, [competitions, session.organizer?.id, session.user.id]);

  useEffect(() => {
    const requests: Promise<unknown>[] = [
      listCompetitions().then(setCompetitions),
    ];

    if (canJoin) {
      requests.push(listRunnerRegistrations().then(setRegistrations));
    }

    Promise.all(requests).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Kunde inte hämta kontoöversikten");
    });
  }, [canJoin]);

  const upcomingItems = useMemo<UpcomingItem[]>(() => {
    const runnerItems = registrations
      .filter((registration) => registration.competition && isUpcoming(registration.competition))
      .map((registration) => ({
        id: `runner-${registration.competitionId}`,
        role: "runner" as const,
        competition: registration.competition as Competition,
      }));

    const timekeeperItems = canReportTimes
      ? competitions
        .filter(isUpcoming)
        .map((competition) => ({
          id: `timekeeper-${competition.id}`,
          role: "timekeeper" as const,
          competition,
        }))
      : [];

    return [...runnerItems, ...timekeeperItems].sort((left, right) => (
      new Date(left.competition.startAt).getTime() - new Date(right.competition.startAt).getTime()
    ));
  }, [canReportTimes, competitions, registrations]);

  const totalLaps = useMemo(() => {
    return registrations.reduce((sum, registration) => sum + registration.lapTimes.length, 0);
  }, [registrations]);

  const longestDistance = Math.round(totalLaps * BACKYARD_LAP_KM);
  const bestRegistration = registrations
    .filter((registration) => registration.lapTimes.length > 0)
    .sort((left, right) => right.lapTimes.length - left.lapTimes.length)[0];
  const resultHistory = registrations.filter((registration) => registration.lapTimes.length > 0);
  const sortedTimingRunners = useMemo(() => {
    return [...timingRunners].sort((left, right) => {
      if (timingSort === "averageLapTime") {
        const averageDifference = calculateAverageLapTime(left.lapTimes) - calculateAverageLapTime(right.lapTimes);

        if (averageDifference !== 0) {
          return averageDifference;
        }
      }

      const runnerNumberDifference = (left.runnerNumber ?? Number.MAX_SAFE_INTEGER)
        - (right.runnerNumber ?? Number.MAX_SAFE_INTEGER);

      if (runnerNumberDifference !== 0) {
        return runnerNumberDifference;
      }

      return `${left.lastName} ${left.firstName}`.localeCompare(`${right.lastName} ${right.firstName}`, "sv");
    });
  }, [timingRunners, timingSort]);

  async function handleBecomeOrganizer() {
    try {
      setError("");
      setMessage("");
      setIsUpdatingRole(true);

      await becomeOrganizer({
        name: session.user.organizerName ?? displayName,
      });

      await onAuthUpdate();
      setActiveRoleView("organizer");
      setMessage("Arrangörsrollen är aktiverad på ditt konto.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera rollen");
    } finally {
      setIsUpdatingRole(false);
    }
  }

  async function handleBecomeTimekeeper() {
    try {
      setError("");
      setMessage("");
      setIsUpdatingRole(true);

      await becomeTimekeeper();

      await onAuthUpdate();
      setActiveRoleView("timekeeper");
      setMessage("Funktionärsrollen är aktiverad på ditt konto.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera rollen");
    } finally {
      setIsUpdatingRole(false);
    }
  }

  async function handleDownloadMyData() {
    try {
      setError("");
      setMessage("");

      const data = await downloadMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `backyard-ultra-data-${session.user.id}.json`;
      link.click();

      URL.revokeObjectURL(downloadUrl);
      setMessage("Din data laddades ner som JSON.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda ner din data");
    }
  }

  async function handleSoftDeleteAccount() {
    const shouldDelete = window.confirm(
      "Vill du begära radering av kontot om 30 dagar? Du loggas ut, men raderingen avbryts om du loggar in igen innan dess.",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await softDeleteMyAccount();
      await onAuthUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte radera kontot");
    }
  }

  async function handleHardDeleteAccount() {
    const shouldDelete = window.confirm(
      "Vill du hårdradera kontot permanent? Detta går inte att ångra.",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await hardDeleteMyAccount();
      await onAuthUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hårdradera kontot");
    }
  }

  function updateCompetitionField<Key extends keyof CreateCompetitionData>(
    key: Key,
    value: CreateCompetitionData[Key],
  ) {
    setCompetitionForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleCompetitionSubmit(event: FormEvent) {
    event.preventDefault();

    if (!canOrganize) {
      setError("Aktivera arrangörsrollen innan du skapar en tävling.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsCreatingCompetition(true);

      const competition = await createCompetition(competitionForm);

      setCompetitions((previous) => [competition, ...previous]);
      setCompetitionForm(initialCompetitionForm);
      setMessage("Tävlingen är publicerad.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skapa tävlingen");
    } finally {
      setIsCreatingCompetition(false);
    }
  }

  function handleRoleViewClick(roleView: ActiveRoleView) {
    if (roleView === "organizer" && !canOrganize) {
      void handleBecomeOrganizer();
      return;
    }

    if (roleView === "timekeeper" && !canReportTimes) {
      void handleBecomeTimekeeper();
      return;
    }

    setActiveRoleView(roleView);
  }

  async function openTimingView(competition: Competition) {
    setActiveTimingCompetition(competition);
    setTimingRunners([]);
    setLapTimeDrafts({});

    try {
      setError("");
      setIsLoadingTimingRunners(true);

      const runners = await listCompetitionRunners(competition.id);

      setTimingRunners(runners);
      setLapTimeDrafts(
        Object.fromEntries(
          runners.map((runner) => [runner.id, runner.lapTimes.join(", ")]),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta deltagare");
    } finally {
      setIsLoadingTimingRunners(false);
    }
  }

  function handleUpcomingClick(item: UpcomingItem) {
    if (item.role === "timekeeper") {
      void openTimingView(item.competition);
    }
  }

  function parseLapTimes(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    const lapTimes = trimmedValue.split(/[,\s]+/).map(Number);

    if (lapTimes.some((lapTime) => !Number.isFinite(lapTime) || lapTime < 0)) {
      throw new Error("Skriv tider som positiva nummer, separerade med komma eller mellanslag.");
    }

    return lapTimes;
  }

  async function handleLapTimesSubmit(event: FormEvent, runner: RunnerRegistration) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      setIsReportingRunnerId(runner.id);

      const lapTimes = parseLapTimes(lapTimeDrafts[runner.id] ?? "");
      const updatedRunner = await reportRunnerLapTimes(runner.id, lapTimes, {
        isManualCorrection: true,
        changeReason: "Manuell korrigering från funktionärsvy",
      });

      setTimingRunners((previous) => previous.map((currentRunner) => (
        currentRunner.id === updatedRunner.id ? updatedRunner : currentRunner
      )));
      setLapTimeDrafts((previous) => ({
        ...previous,
        [updatedRunner.id]: updatedRunner.lapTimes.join(", "),
      }));
      setMessage(`Tider sparade för ${runner.firstName} ${runner.lastName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte spara tider");
    } finally {
      setIsReportingRunnerId(null);
    }
  }

  async function handleFinishClick(runner: RunnerRegistration) {
    if (!activeTimingCompetition) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setIsReportingRunnerId(runner.id);

      const finishSeconds = getCurrentLapElapsedSeconds(activeTimingCompetition);
      const updatedRunner = await reportRunnerLapTimes(
        runner.id,
        [...runner.lapTimes, finishSeconds],
        { status: "active" },
      );

      setTimingRunners((previous) => previous.map((currentRunner) => (
        currentRunner.id === updatedRunner.id ? updatedRunner : currentRunner
      )));
      setLapTimeDrafts((previous) => ({
        ...previous,
        [updatedRunner.id]: updatedRunner.lapTimes.join(", "),
      }));
      setMessage(`Målgång registrerad för ${runner.firstName} ${runner.lastName}: ${formatSeconds(finishSeconds)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte registrera målgång");
    } finally {
      setIsReportingRunnerId(null);
    }
  }

  async function handleDnfClick(runner: RunnerRegistration) {
    try {
      setError("");
      setMessage("");
      setIsReportingRunnerId(runner.id);

      const updatedRunner = await reportRunnerLapTimes(runner.id, runner.lapTimes, {
        status: "dnf",
      });

      setTimingRunners((previous) => previous.map((currentRunner) => (
        currentRunner.id === updatedRunner.id ? updatedRunner : currentRunner
      )));
      setMessage(`DNF registrerad för ${runner.firstName} ${runner.lastName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte registrera DNF");
    } finally {
      setIsReportingRunnerId(null);
    }
  }

  if (activeTimingCompetition) {
    const currentRaceLapNumber = getCurrentRaceLapNumber(activeTimingCompetition);

    return (
      <main className="profile-shell">
        <section className="profile-page-heading">
          <button
            type="button"
            className="profile-back-button"
            onClick={() => setActiveTimingCompetition(null)}
          >
            Tillbaka till profilen
          </button>
          <p className="profile-eyebrow">Arrangörsyta</p>
          <h1>Tidtagning</h1>
          <p>{activeTimingCompetition.name} · {activeTimingCompetition.place}</p>
        </section>

        {error && <div className="profile-alert profile-alert--error">{error}</div>}
        {message && <div className="profile-alert profile-alert--success">{message}</div>}

        <section className="profile-panel timing-panel">
            <div className="profile-panel__header">
              <div>
                <p className="profile-panel__kicker">Funktionär</p>
                <h2>Rapportera varvtider</h2>
              </div>
              <div className="timing-toolbar">
                <label>
                  Sortera
                  <select
                    value={timingSort}
                    onChange={(event) => setTimingSort(event.target.value as TimingSort)}
                  >
                    <option value="runnerNumber">Löparnummer</option>
                    <option value="averageLapTime">Snittid</option>
                  </select>
                </label>
                <span>{timingRunners.length} deltagare</span>
              </div>
            </div>

          {isLoadingTimingRunners ? (
            <p className="profile-empty">Hämtar deltagare...</p>
          ) : timingRunners.length === 0 ? (
            <p className="profile-empty">Inga deltagare finns att tidrapportera ännu.</p>
          ) : (
            <div className="timing-runner-list">
              {sortedTimingRunners.map((runner) => {
                const averageLapTime = calculateAverageLapTime(runner.lapTimes);
                const runnerInfo = getRunnerInfo(runner);
                const isReporting = isReportingRunnerId === runner.id;
                const isDnf = runner.status === "dnf";
                const hasMissedPreviousLap = runner.lapTimes.length < currentRaceLapNumber - 1;

                return (
                  <form
                    className="timing-runner"
                    key={runner.id}
                    onSubmit={(event) => void handleLapTimesSubmit(event, runner)}
                  >
                    <div>
                      <strong title={runnerInfo}>
                        {runner.runnerNumber ? `${runner.runnerNumber}. ` : ""}
                        {runner.firstName} {runner.lastName}
                      </strong>
                      <span title={runnerInfo}>{runnerInfo}</span>
                      <small>
                        Snitt: {Number.isFinite(averageLapTime) ? formatSeconds(averageLapTime) : "-"}
                        {isDnf ? " · DNF" : ""}
                      </small>
                    </div>
                    <input
                      type="text"
                      value={lapTimeDrafts[runner.id] ?? ""}
                      onChange={(event) => setLapTimeDrafts((previous) => ({
                        ...previous,
                        [runner.id]: event.target.value,
                      }))}
                      placeholder="52, 54, 51"
                      aria-label={`Varvtider för ${runner.firstName} ${runner.lastName}`}
                    />
                    <div className="timing-runner__actions">
                      {hasMissedPreviousLap || isDnf ? (
                        <button
                          type="button"
                          className="is-danger"
                          onClick={() => void handleDnfClick(runner)}
                          disabled={isReporting || isDnf}
                        >
                          DNF
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleFinishClick(runner)}
                          disabled={isReporting}
                        >
                          Mål
                        </button>
                      )}
                      <button type="submit" disabled={isReporting}>
                        {isReporting ? "Sparar..." : "Korrigera"}
                      </button>
                    </div>
                  </form>
                );
              })}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="profile-shell">
      <section className="profile-page-heading">
        <div className="profile-role-tabs" aria-label="Roller">
          <button
            type="button"
            className={`profile-role ${activeRoleView === "runner" ? "is-active" : ""}`}
            onClick={() => handleRoleViewClick("runner")}
          >
            <span /> Löpare
          </button>
          <button
            type="button"
            className={`profile-role ${activeRoleView === "organizer" ? "is-active" : ""}`}
            onClick={() => handleRoleViewClick("organizer")}
            disabled={isUpdatingRole}
          >
            <span /> Arrangör
          </button>
          <button
            type="button"
            className={`profile-role ${activeRoleView === "timekeeper" ? "is-active" : ""}`}
            onClick={() => handleRoleViewClick("timekeeper")}
            disabled={isUpdatingRole}
          >
            <span /> Funktionär
          </button>
        </div>

        <p className="profile-eyebrow">
          {activeRoleView === "organizer"
            ? "Skapa och administrera tävlingar"
            : activeRoleView === "timekeeper"
              ? "Rapportera tider för kommande tävlingar"
              : "Min statistik, anmälningar och resultat"}
        </p>
        <h1>
          {activeRoleView === "organizer"
            ? "Arrangörsyta"
            : activeRoleView === "timekeeper"
              ? "Funktionärsyta"
              : "Min löparprofil"}
        </h1>
      </section>

      {error && <div className="profile-alert profile-alert--error">{error}</div>}
      {message && <div className="profile-alert profile-alert--success">{message}</div>}

      {activeRoleView === "organizer" && (
        <section className="organizer-workspace">
          <section className="profile-panel organizer-create">
            <div className="profile-panel__header">
              <div>
                <p className="profile-panel__kicker">Arrangera</p>
                <h2>Skapa tävling</h2>
              </div>
            </div>

            <form className="organizer-form" onSubmit={handleCompetitionSubmit}>
              <label>
                Namn
                <input
                  type="text"
                  value={competitionForm.name}
                  onChange={(event) => updateCompetitionField("name", event.target.value)}
                  placeholder="Backyard Ultra Umeå"
                  required
                />
              </label>

              <label>
                Sport eller tävlingstyp
                <input
                  type="text"
                  value={competitionForm.type}
                  onChange={(event) => updateCompetitionField("type", event.target.value)}
                  placeholder="Backyard Ultra, Trail, Ultra..."
                  required
                />
              </label>

              <div className="organizer-form__grid">
                <label>
                  Start
                  <input
                    type="datetime-local"
                    value={competitionForm.startAt}
                    onChange={(event) => updateCompetitionField("startAt", event.target.value)}
                    required
                  />
                </label>

                <label>
                  Slut, valfritt
                  <input
                    type="datetime-local"
                    value={competitionForm.endAt ?? ""}
                    onChange={(event) => updateCompetitionField("endAt", event.target.value || null)}
                  />
                </label>
              </div>

              <label>
                Plats
                <input
                  type="text"
                  value={competitionForm.place}
                  onChange={(event) => updateCompetitionField("place", event.target.value)}
                  placeholder="Umeå"
                  required
                />
              </label>

              <button type="submit" disabled={isCreatingCompetition}>
                {isCreatingCompetition ? "Publicerar..." : "Publicera tävling"}
              </button>
            </form>
          </section>

          <section className="profile-panel">
            <div className="profile-panel__header">
              <div>
                <p className="profile-panel__kicker">Dina tävlingar</p>
                <h2>Arrangemang</h2>
              </div>
              <span>{organizerCompetitions.length} st</span>
            </div>

            {organizerCompetitions.length === 0 ? (
              <p className="profile-empty">Du har inte skapat någon tävling ännu.</p>
            ) : (
              <div className="profile-event-list">
                {organizerCompetitions.map((competition) => (
                  <article className="organizer-event" key={competition.id}>
                    <span className="profile-event__icon">
                      <Trophy size={20} />
                    </span>
                    <span>
                      <strong>{competition.name}</strong>
                      <small>{formatDateTime(competition.startAt)} · {competition.place}</small>
                    </span>
                    <em>{competition.type}</em>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      {activeRoleView === "timekeeper" && (
        <section className="profile-panel profile-available">
          <div className="profile-panel__header">
            <div>
              <p className="profile-panel__kicker">Funktionär</p>
              <h2>Välj tävling för tidtagning</h2>
            </div>
            <Timer size={18} />
          </div>
          <div className="profile-event-list">
            {competitions.filter(isUpcoming).map((competition) => (
              <button
                type="button"
                className="profile-event"
                key={competition.id}
                onClick={() => void openTimingView(competition)}
              >
                <span className="profile-event__icon">
                  <Timer size={20} />
                </span>
                <span>
                  <strong>{competition.name}</strong>
                  <small>{formatDateTime(competition.startAt)} · {competition.place}</small>
                </span>
                <em>Tidtagning</em>
                <span className="profile-event__arrow">&gt;</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {activeRoleView === "runner" && (
        <>
          <section className="profile-card profile-identity">
            <div className="profile-avatar">{getInitials(session.user.firstName, session.user.lastName)}</div>
            <div>
              <h2>{displayName}</h2>
              <p>
                <User size={15} /> Löpare
                {session.user.club && <> · {session.user.club}</>}
                {session.user.organizerName && <> · {session.user.organizerName}</>}
              </p>
            </div>
          </section>

          <section className="profile-stats" aria-label="Din statistik">
            <article className="profile-stat-card">
              <span>Bästa resultat</span>
              <strong>{bestRegistration ? `#${bestRegistration.lapTimes.length}` : "-"}</strong>
              <p>{bestRegistration?.competition?.name ?? "Inget resultat ännu"}</p>
            </article>
            <article className="profile-stat-card">
              <span>Totalt varv</span>
              <strong>{totalLaps}</strong>
              <p>Alla tävlingar</p>
            </article>
            <article className="profile-stat-card">
              <span>Längsta sträcka</span>
              <strong>{longestDistance} km</strong>
              <p>{totalLaps} varv × 6.706 km</p>
            </article>
            <article className="profile-stat-card">
              <span>Kommande</span>
              <strong>{upcomingItems.length}</strong>
              <p>Tävlingar och uppdrag</p>
            </article>
          </section>

          <section className="profile-content-grid">
            <section className="profile-panel">
              <div className="profile-panel__header">
                <h2>Kommande</h2>
              </div>

              {upcomingItems.length === 0 ? (
                <p className="profile-empty">Du har inget kommande ännu.</p>
              ) : (
                <div className="profile-event-list">
                  {upcomingItems.map((item) => (
                    <button
                      type="button"
                      className="profile-event"
                      key={item.id}
                      onClick={() => handleUpcomingClick(item)}
                      disabled={item.role !== "timekeeper"}
                    >
                      <span className="profile-event__icon">
                        {item.role === "timekeeper" ? <Timer size={20} /> : <Trophy size={20} />}
                      </span>
                      <span>
                        <strong>{item.competition.name}</strong>
                        <small>
                          {formatDateTime(item.competition.startAt)} · {item.competition.place}
                        </small>
                      </span>
                      <em>{item.role === "timekeeper" ? "Tidtagning" : "Anmäld"}</em>
                      <span className="profile-event__arrow">{item.role === "timekeeper" ? ">" : ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="profile-panel">
              <div className="profile-panel__header">
                <h2>Resultathistorik</h2>
              </div>

              {resultHistory.length === 0 ? (
                <p className="profile-empty">Inga rapporterade resultat ännu.</p>
              ) : (
                <div className="profile-result-list">
                  {resultHistory.map((registration) => (
                    <article className="profile-result" key={registration.id}>
                      <span>#{registration.lapTimes.length}</span>
                      <div>
                        <strong>{registration.competition?.name ?? "Tävling"}</strong>
                        <small>
                          {registration.competition
                            ? `${formatDateTime(registration.competition.startAt)} · ${registration.competition.place}`
                            : "Datum saknas"}
                        </small>
                      </div>
                      <b>{registration.lapTimes.length} varv</b>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>

          <section className="profile-panel profile-available">
            <div className="profile-panel__header">
              <div>
                <p className="profile-panel__kicker">På kommande</p>
                <h2>Alla tävlingar</h2>
              </div>
              <MapPin size={18} />
            </div>
            <div className="profile-available-grid">
              {competitions.filter(isUpcoming).slice(0, 4).map((competition) => (
                <article className="profile-mini-card" key={competition.id}>
                  <span>{competition.type}</span>
                  <strong>{competition.name}</strong>
                  <p>{formatDateTime(competition.startAt)} · {competition.place}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="profile-panel profile-privacy">
        <div className="profile-panel__header">
          <div>
            <p className="profile-panel__kicker">Integritet</p>
            <h2>Din data</h2>
          </div>
        </div>
        <div className="profile-privacy__actions">
          <button type="button" onClick={() => void handleDownloadMyData()}>
            Ladda ner min data
          </button>
          <button type="button" onClick={() => void handleSoftDeleteAccount()}>
            Begär radering om 30 dagar
          </button>
          <button type="button" className="is-danger" onClick={() => void handleHardDeleteAccount()}>
            Hard delete konto
          </button>
        </div>
      </section>
    </main>
  );
}
