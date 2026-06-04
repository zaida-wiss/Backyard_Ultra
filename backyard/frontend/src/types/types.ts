
export type Runner = {
  id: number;
  name: string;
  lapTimes:number[];
};

export type RunnersProps = {
  runners: Runner[];
};

export type Organizer = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "organizer";
  createdAt: string;
  updatedAt?: string;
};

export type AuthRole = "user" | "admin" | "organizer" | "runner" | "timekeeper";

export type CompetitionStatus = "draft" | "open" | "closed" | "in_progress" | "finished";

export type RegistrationMode = "self_service" | "organizer_only" | "both";

export type RegistrationType = "individual" | "team";

export type RunnerStatus = "registered" | "active" | "dnf" | "finished";

export type TeamMember = {
  firstName: string;
  lastName: string;
};

export type UserAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  club: string | null;
  organizerName: string | null;
  roles: AuthRole[];
  deletedAt: string | null;
  deletionRequestedAt: string | null;
  deletionScheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RunnerAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  club: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: UserAccount;
  runner: RunnerAccount | null;
  organizer: Organizer | null;
};

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

export type RunnerRegistration = {
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

export type RunnerRegistrationWithCompetition = RunnerRegistration & {
  competition?: Competition;
};

export type TimekeeperAssignment = {
  id: string;
  competitionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type TimekeeperAssignmentWithCompetition = TimekeeperAssignment & {
  competition: Competition | null;
};

export type CreateCompetitionData = {
  name: string;
  type: string;
  templateKey?: "backyard-ultra";
  status?: CompetitionStatus;
  place: string;
  startAt: string;
  endAt: string | null;
  registrationDeadline?: string | null;
  isPublic?: boolean;
  registrationMode?: RegistrationMode;
  allowTeamRegistration?: boolean;
  allowRepresentingOrganization?: boolean;
};
