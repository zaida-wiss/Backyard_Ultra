import { useEffect, useMemo, useState } from "react";
import { MapPin, Trophy } from "lucide-react";
import {
  listCompetitions,
  listRunnerRegistrations,
  registerCurrentRunnerForCompetition,
} from "../../services/api";
import type {
  Competition,
  RunnerAccount,
  RunnerRegistrationWithCompetition,
} from "../../types/types";
import "../Dashboard/Dashboard.css";

type RunnerDashboardProps = {
  runner: RunnerAccount;
  token: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RunnerDashboard({ runner, token }: RunnerDashboardProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [registrations, setRegistrations] = useState<RunnerRegistrationWithCompetition[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmittingCompetitionId, setIsSubmittingCompetitionId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      listCompetitions(),
      listRunnerRegistrations(token),
    ])
      .then(([competitionsResponse, registrationsResponse]) => {
        setCompetitions(competitionsResponse);
        setRegistrations(registrationsResponse);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Kunde inte hämta tävlingar");
      });
  }, [token]);

  const registeredCompetitionIds = useMemo(() => {
    return new Set(registrations.map((registration) => registration.competitionId));
  }, [registrations]);

  async function handleRegisterClick(competition: Competition) {
    try {
      setError("");
      setSuccess("");
      setIsSubmittingCompetitionId(competition.id);

      const registration = await registerCurrentRunnerForCompetition(token, competition.id);

      setRegistrations((previous) => [
        { ...registration, competition },
        ...previous,
      ]);
      setSuccess(`Du är anmäld till ${competition.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte anmäla dig");
    } finally {
      setIsSubmittingCompetitionId(null);
    }
  }

  return (
    <main className="dashboard">
      <section className="dashboard__intro">
        <div>
          <p className="dashboard__eyebrow">Löparyta</p>
          <h1>{runner.firstName} {runner.lastName}</h1>
        </div>
        <div className="dashboard__stat">
          <Trophy size={20} />
          <span>{registrations.length}</span>
          <small>anmälningar</small>
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <section className="competition-list" aria-label="Tillgängliga lopp">
        <h2>Tillgängliga lopp</h2>

        {competitions.length === 0 ? (
          <p className="competition-list__empty">Inga lopp finns registrerade ännu.</p>
        ) : (
          <div className="competition-list__items">
            {competitions.map((competition) => {
              const isRegistered = registeredCompetitionIds.has(competition.id);
              const isSubmitting = isSubmittingCompetitionId === competition.id;

              return (
                <article className="competition-card" key={competition.id}>
                  <div>
                    <h3>{competition.name}</h3>
                    <p>{competition.type}</p>
                  </div>
                  <p className="competition-card__place">
                    <MapPin size={16} />
                    {competition.place}
                  </p>
                  <p>{formatDateTime(competition.startAt)} till {formatDateTime(competition.endAt)}</p>
                  <button
                    type="button"
                    className="competition-card__action"
                    disabled={isRegistered || isSubmitting}
                    onClick={() => handleRegisterClick(competition)}
                  >
                    {isRegistered ? "Anmäld" : isSubmitting ? "Anmäler..." : "Anmäl mig"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
