
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

export type AuthRole = "user" | "admin" | "organizer" | "runner";

export type UserAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  club: string | null;
  organizerName: string | null;
  roles: AuthRole[];
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
  token: string;
};

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

export type RunnerRegistration = {
  id: string;
  competitionId: string;
  runnerAccountId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  club: string | null;
  status: "registered";
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RunnerRegistrationWithCompetition = RunnerRegistration & {
  competition?: Competition;
};

export type CreateCompetitionData = {
  name: string;
  type: string;
  place: string;
  startAt: string;
  endAt: string | null;
};
