export type Organizer = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
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
};

export type PublicRunnerAccount = Omit<RunnerAccount, "passwordHash">;

export type Competition = {
  id: string;
  organizerId: number;
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
  competitionId: number;
  runnerAccountId: number | null;
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
  organizerId: number;
  name: string;
  type: string;
  place: string;
  startAt: string;
  endAt: string;
};

export type CreateRunnerInput = {
  competitionId: number;
  runnerAccountId?: number | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  club?: string | null;
};

export type AuthRole = "organizer" | "runner";

export type TokenPayload = {
  sub: number;
  email: string;
  role: AuthRole;
  exp: number;
};
