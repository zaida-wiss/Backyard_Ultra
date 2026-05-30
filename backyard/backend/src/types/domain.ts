export type Organizer = {
  id: string;
  name: string;
  email: string;
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

export type Competition = {
  id: string;
  organizerId: string;
  name: string;
  type: string;
  place: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
};

export type RunnerStatus = "registered";

export type Runner = {
  id: string;
  competitionId: string;
  runnerAccountId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  club: string | null;
  status: RunnerStatus;
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
  place: string;
  startAt: string;
  endAt: string;
};

export type CreateRunnerInput = {
  competitionId: string;
  runnerAccountId?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  club?: string | null;
};

export type AuthRole = "admin" | "organizer" | "runner";

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
};

export type TokenPayload = {
  sub: string;
  email: string;
  role: AuthRole;
  exp: number;
};
