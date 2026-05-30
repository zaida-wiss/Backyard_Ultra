import type {
  AuthResponse,
  Competition,
  CreateCompetitionData,
  RunnerRegistration,
  RunnerRegistrationWithCompetition,
} from "../types/types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
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

export async function registerOrganizer(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/organizers/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await parseResponse<Omit<AuthResponse, "role">>(response);
  return { ...body, role: "organizer" } as AuthResponse;
}

export async function loginOrganizer(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/organizers/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await parseResponse<Omit<AuthResponse, "role">>(response);
  return { ...body, role: "organizer" } as AuthResponse;
}

export async function registerRunner(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  club: string | null;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/runners/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await parseResponse<Omit<AuthResponse, "role">>(response);
  return { ...body, role: "runner" } as AuthResponse;
}

export async function loginRunner(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/runners/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await parseResponse<Omit<AuthResponse, "role">>(response);
  return { ...body, role: "runner" } as AuthResponse;
}

export async function createCompetition(
  token: string,
  data: CreateCompetitionData,
): Promise<Competition> {
  const response = await fetch(`${API_BASE_URL}/competitions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return parseResponse<Competition>(response);
}

export async function listCompetitions(organizerId?: string): Promise<Competition[]> {
  const query = organizerId ? `?organizerId=${organizerId}` : "";
  const response = await fetch(`${API_BASE_URL}/competitions${query}`);

  return parseResponse<Competition[]>(response);
}

export async function registerCurrentRunnerForCompetition(
  token: string,
  competitionId: string,
): Promise<RunnerRegistration> {
  const response = await fetch(`${API_BASE_URL}/competitions/${competitionId}/runners/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<RunnerRegistration>(response);
}

export async function listRunnerRegistrations(
  token: string,
): Promise<RunnerRegistrationWithCompetition[]> {
  const response = await fetch(`${API_BASE_URL}/runners/me/registrations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<RunnerRegistrationWithCompetition[]>(response);
}
