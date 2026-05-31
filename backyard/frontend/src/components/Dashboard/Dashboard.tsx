import { useEffect, useState, type FormEvent } from "react";
import { CalendarPlus, MapPin, Trophy } from "lucide-react";
import { createCompetition, listCompetitions } from "../../services/api";
import type { Competition, CreateCompetitionData, Organizer } from "../../types/types";
import "./Dashboard.css";

type DashboardProps = {
  organizer: Organizer;
};

const initialCompetitionForm: CreateCompetitionData = {
  name: "",
  type: "",
  place: "",
  startAt: "",
  endAt: "",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCompetitionDates(competition: Competition) {
  if (!competition.endAt) {
    return `Startar ${formatDateTime(competition.startAt)}`;
  }

  return `${formatDateTime(competition.startAt)} till ${formatDateTime(competition.endAt)}`;
}

export default function Dashboard ({ organizer }: DashboardProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [competitionForm, setCompetitionForm] = useState<CreateCompetitionData>(initialCompetitionForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listCompetitions(organizer.id)
      .then(setCompetitions)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Kunde inte hämta tävlingar");
      });
  }, [organizer.id]);

  function updateCompetitionField<Key extends keyof CreateCompetitionData>(
    key: Key,
    value: CreateCompetitionData[Key],
  ) {
    setCompetitionForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleCompetitionSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");
      setIsSubmitting(true);

      const competition = await createCompetition(competitionForm);

      setCompetitions((previous) => [competition, ...previous]);
      setCompetitionForm(initialCompetitionForm);
      setSuccess("Loppet är registrerat.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte registrera loppet");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="dashboard">
      <section className="dashboard__intro">
        <div>
          <p className="dashboard__eyebrow">Arrangörsyta</p>
          <h1>{organizer.name}</h1>
        </div>
        <div className="dashboard__stat">
          <Trophy size={20} />
          <span>{competitions.length}</span>
          <small>registrerade lopp</small>
        </div>
      </section>

      <section className="competition-workspace">
        <form className="competition-form" onSubmit={handleCompetitionSubmit}>
          <div className="competition-form__header">
            <CalendarPlus size={22} />
            <h2>Registrera lopp</h2>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <label>
            Vad heter loppet?
            <input
              type="text"
              value={competitionForm.name}
              onChange={(event) => updateCompetitionField("name", event.target.value)}
              placeholder="Skogsgläntans Backyard Ultra"
              required
            />
          </label>

          <label>
            Vilken sorts lopp?
            <select
              value={competitionForm.type}
              onChange={(event) => updateCompetitionField("type", event.target.value)}
              required
            >
              <option value="">Välj typ</option>
              <option value="Backyard Ultra">Backyard Ultra</option>
              <option value="Trail">Trail</option>
              <option value="Ultra">Ultra</option>
              <option value="Stadslopp">Stadslopp</option>
            </select>
          </label>

          <div className="competition-form__grid">
            <label>
              Från och med
              <input
                type="datetime-local"
                value={competitionForm.startAt}
                onChange={(event) => updateCompetitionField("startAt", event.target.value)}
                required
              />
            </label>

            <label>
              Till och med (valfritt)
              <input
                type="datetime-local"
                value={competitionForm.endAt ?? ""}
                onChange={(event) => updateCompetitionField("endAt", event.target.value)}
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

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrerar..." : "Registrera lopp"}
          </button>
        </form>

        <section className="competition-list" aria-label="Registrerade lopp">
          <h2>Dina lopp</h2>

          {competitions.length === 0 ? (
            <p className="competition-list__empty">Inga lopp registrerade ännu.</p>
          ) : (
            <div className="competition-list__items">
              {competitions.map((competition) => (
                <article className="competition-card" key={competition.id}>
                  <div>
                    <h3>{competition.name}</h3>
                    <p>{competition.type}</p>
                  </div>
                  <p className="competition-card__place">
                    <MapPin size={16} />
                    {competition.place}
                  </p>
                  <p>{formatCompetitionDates(competition)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
