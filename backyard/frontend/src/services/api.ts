import type {
  AuthResponse,
  Competition,
  CreateCompetitionData,
  RunnerRegistration,
  RunnerRegistrationWithCompetition,
  RunnerStatus,
  TimekeeperAssignmentWithCompetition,
} from "../types/types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

type ReportRunnerLapTimesOptions = {
  status?: RunnerStatus;
  isManualCorrection?: boolean;
  changeReason?: string | null;
};

function getApiErrorMessage(body: unknown) {
  if (
    body
    && typeof body === "object"
    && "error" in body
    && body.error
    && typeof body.error === "object"
    && "message" in body.error
    && typeof body.error.message === "string"
  ) {
    return body.error.message;
  }

  return null;
}

async function parseResponse<ResponseBody>(response: Response): Promise<ResponseBody> {
  const body = await response.json().catch(() => null) as ApiErrorResponse | ResponseBody | null;

  if (!response.ok) {
    const message = getApiErrorMessage(body) ?? "Något gick fel mot API:t";

    throw new Error(message);
  }

  return body as ResponseBody;
}

function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
  });
}

export async function getCurrentSession(): Promise<AuthResponse | null> {
  const response = await apiFetch("/auth/me");

  if (response.status === 401) {
    return null;
  }

  return parseResponse<AuthResponse>(response);
}

export async function logoutUser(): Promise<void> {
  const response = await apiFetch("/auth/logout", {
    method: "POST",
  });

  return parseResponse<void>(response);
}

export async function downloadMyData(): Promise<unknown> {
  const response = await apiFetch("/auth/me/export");

  return parseResponse<unknown>(response);
}

export async function softDeleteMyAccount(): Promise<void> {
  const response = await apiFetch("/auth/me", {
    method: "DELETE",
  });

  await parseResponse<void>(response);
}

export async function hardDeleteMyAccount(): Promise<void> {
  const response = await apiFetch("/auth/me/hard", {
    method: "DELETE",
  });

  await parseResponse<void>(response);
}

export async function registerOrganizer(data: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  const response = await apiFetch("/organizers/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  await parseResponse<unknown>(response);
}

export async function loginOrganizer(data: {
  email: string;
  password: string;
}): Promise<void> {
  const response = await apiFetch("/organizers/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  await parseResponse<unknown>(response);
}

export async function registerRunner(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  club: string | null;
}): Promise<void> {
  const response = await apiFetch("/runners/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  await parseResponse<unknown>(response);
}

export const registerUser = registerRunner;

export async function loginRunner(data: {
  email: string;
  password: string;
}): Promise<void> {
  const response = await apiFetch("/runners/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  await parseResponse<unknown>(response);
}

export const loginUser = loginRunner;

export async function becomeOrganizer(
  data: { name: string },
): Promise<void> {
  const response = await apiFetch("/organizers/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  await parseResponse<unknown>(response);
}

export async function becomeTimekeeper(): Promise<void> {
  const response = await apiFetch("/timekeepers/me", {
    method: "POST",
  });

  await parseResponse<unknown>(response);
}

export async function listMyTimekeeperAssignments(): Promise<TimekeeperAssignmentWithCompetition[]> {
  const response = await apiFetch("/timekeepers/me/assignments");

  return parseResponse<TimekeeperAssignmentWithCompetition[]>(response);
}

export async function assignTimekeeperToCompetition(
  competitionId: string,
  email: string,
): Promise<TimekeeperAssignmentWithCompetition> {
  const response = await apiFetch(`/timekeepers/competitions/${competitionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return parseResponse<TimekeeperAssignmentWithCompetition>(response);
}

export async function reportRunnerLapTimes(
  runnerId: string,
  lapTimes: number[],
  options: ReportRunnerLapTimesOptions = {},
): Promise<RunnerRegistration> {
  const response = await apiFetch(`/runners/${runnerId}/lap-times`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lapTimes,
      ...options,
    }),
  });

  return parseResponse<RunnerRegistration>(response);
}

export async function createCompetition(
  data: CreateCompetitionData,
): Promise<Competition> {
  const response = await apiFetch("/competitions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseResponse<Competition>(response);
}

export async function listCompetitions(organizerId?: string): Promise<Competition[]> {
  const query = organizerId ? `?organizerId=${organizerId}` : "";
  const response = await apiFetch(`/competitions${query}`);

  return parseResponse<Competition[]>(response);
}

export async function registerCurrentRunnerForCompetition(
  competitionId: string,
): Promise<RunnerRegistration> {
  const response = await apiFetch(`/competitions/${competitionId}/runners/me`, {
    method: "POST",
  });

  return parseResponse<RunnerRegistration>(response);
}

export async function listCompetitionRunners(
  competitionId: string,
): Promise<RunnerRegistration[]> {
  const response = await apiFetch(`/competitions/${competitionId}/runners`);

  return parseResponse<RunnerRegistration[]>(response);
}

export async function listRunnerRegistrations(): Promise<RunnerRegistrationWithCompetition[]> {
  const response = await apiFetch("/runners/me/registrations");

  return parseResponse<RunnerRegistrationWithCompetition[]>(response);
}
