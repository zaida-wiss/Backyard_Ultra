import { createCompetition } from "../models/competition.model";
import { createOrganizer } from "../models/organizer.model";
import { createRunner } from "../models/runner.model";
import { createRunnerAccount } from "../models/runnerAccount.model";
import type { Competition, Organizer, Runner, RunnerAccount } from "../types/domain";
import { hashPassword } from "../utils/security";

export const organizers: Organizer[] = [
  createOrganizer({
    name: 'Backyard Ultra Sverige',
    email: 'arrangor@example.com',
    passwordHash: hashPassword('password123'),
  }),
];

export const runnerAccounts: RunnerAccount[] = [
  createRunnerAccount({
    firstName: 'Erik',
    lastName: 'Marklund',
    email: 'erik@example.com',
    passwordHash: hashPassword('password123'),
    club: 'Trailklubben',
  }),
];

export const competitions: Competition[] = [
  createCompetition({
    organizerId: 1,
    name: 'Skogsgläntans Backyard Ultra',
    type: 'Backyard Ultra',
    place: 'Umeå',
    startAt: '2026-06-13T10:00',
    endAt: '2026-06-14T18:00',
  }),
];

export const runners: Runner[] = [
  createRunner({
    competitionId: 1,
    runnerAccountId: 1,
    firstName: 'Erik',
    lastName: 'Marklund',
    email: 'erik@example.com',
    club: 'Trailklubben',
  }),
  createRunner({
    competitionId: 1,
    firstName: 'Lars',
    lastName: 'Kolmodin',
    email: 'lars@example.com',
    club: 'Löparlaget',
  }),
];
