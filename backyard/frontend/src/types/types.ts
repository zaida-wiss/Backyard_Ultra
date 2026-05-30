
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
};

export type RunnerAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  club: string | null;
  createdAt: string;
};

export type AuthRole = "organizer" | "runner";

export type OrganizerAuthResponse = {
  role: "organizer";
  organizer: Organizer;
  token: string;
};

export type RunnerAuthResponse = {
  role: "runner";
  runner: RunnerAccount;
  token: string;
};

export type AuthResponse = OrganizerAuthResponse | RunnerAuthResponse;

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
  endAt: string;
};
