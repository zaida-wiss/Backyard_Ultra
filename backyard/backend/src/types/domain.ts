export type Organizer = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "organizer";
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicOrganizer = Omit<Organizer, "passwordHash">;

export type RunnerAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  club: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicRunnerAccount = Omit<RunnerAccount, "passwordHash">;

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  club: string | null;
  organizerName: string | null;
  roles: AuthRole[];
  deletedAt: string | null;
  deletionRequestedAt: string | null;
  deletionScheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Competition = {
  id: string;
  organizerId: string;
  name: string;
  type: string;
  templateKey: "backyard-ultra";
  status: CompetitionStatus;
  place: string;
  startAt: string;
  endAt: string | null;
  registrationDeadline: string | null;
  isPublic: boolean;
  registrationMode: RegistrationMode;
  allowTeamRegistration: boolean;
  allowRepresentingOrganization: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompetitionStatus = "draft" | "open" | "closed" | "in_progress" | "finished";

export type RegistrationMode = "self_service" | "organizer_only" | "both";

export type RunnerStatus = "registered" | "active" | "dnf" | "finished";

export type RegistrationType = "individual" | "team";

export type TeamMember = {
  firstName: string;
  lastName: string;
};

export type Runner = {
  id: string;
  competitionId: string;
  runnerAccountId: string | null;
  runnerNumber: number | null;
  registrationType: RegistrationType;
  teamName: string | null;
  teamMembers: TeamMember[];
  firstName: string;
  lastName: string;
  email: string | null;
  club: string | null;
  lapTimes: number[];
  status: RunnerStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrganizerInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export type CreateRunnerAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  club?: string | null;
};

export type CreateCompetitionInput = {
  organizerId: string;
  name: string;
  type: string;
  templateKey: "backyard-ultra";
  status: CompetitionStatus;
  place: string;
  startAt: string;
  endAt: string | null;
  registrationDeadline: string | null;
  isPublic: boolean;
  registrationMode: RegistrationMode;
  allowTeamRegistration: boolean;
  allowRepresentingOrganization: boolean;
};

export type CreateRunnerInput = {
  competitionId: string;
  runnerAccountId?: string | null;
  runnerNumber?: number | null;
  registrationType?: RegistrationType;
  teamName?: string | null;
  teamMembers?: TeamMember[];
  firstName: string;
  lastName: string;
  email?: string | null;
  club?: string | null;
};

export type AuthRole = "user" | "admin" | "organizer" | "runner" | "timekeeper";

export type AuthUser = {
  id: string;
  email: string;
  roles: AuthRole[];
};

export type TokenPayload = {
  sub: string;
  email: string;
  roles: AuthRole[];
  exp: number;
};
