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
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Competition = {
  id: string;
  organizerId: string;
  name: string;
  type: string;
  place: string;
  startAt: string;
  endAt: string | null;
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
  place: string;
  startAt: string;
  endAt: string | null;
};

export type CreateRunnerInput = {
  competitionId: string;
  runnerAccountId?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  club?: string | null;
};

export type AuthRole = "user" | "admin" | "organizer" | "runner";

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
