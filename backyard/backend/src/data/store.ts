import type { Competition, Organizer, Runner, RunnerAccount } from "../types/domain";

// Legacy in-memory store kept only as a reference while learning.
// The API controllers now use MongoDB through Mongoose models instead.
export const organizers: Organizer[] = [];
export const runnerAccounts: RunnerAccount[] = [];
export const competitions: Competition[] = [];
export const runners: Runner[] = [];
