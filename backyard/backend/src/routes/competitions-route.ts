import { Router } from "express";

import {
  createCompetitionForOrganizer,
  deleteCompetition,
  getCompetitionById,
  listCompetitions,
  updateCompetition,
} from "../controllers/competitionsController";
import {
  listCompetitionRunners,
  registerCurrentRunnerForCompetition,
  registerRunner,
} from "../controllers/runnersController";
import { requireAuth, requireRunnerAuth } from "../middleware/auth";
import { parseCompetitionFiltersHandler } from "../middleware/competitionFilters";
import { validateCompetition, validateRunner } from "../middleware/validate";

const router = Router();

// GET /api/v1/competitions
// Kan filtreras med ?organizerId=1 eller ?type=Backyard%20Ultra.
router.get('/', parseCompetitionFiltersHandler, listCompetitions);

// POST /api/v1/competitions
// Kräver inloggad arrangör.
router.post('/', requireAuth, validateCompetition, createCompetitionForOrganizer);

// GET /api/v1/competitions/:id
router.get('/:id', getCompetitionById);

// PUT /api/v1/competitions/:id
router.put('/:id', requireAuth, validateCompetition, updateCompetition);

// DELETE /api/v1/competitions/:id
router.delete('/:id', requireAuth, deleteCompetition);

// GET /api/v1/competitions/:competitionId/runners
router.get('/:competitionId/runners', listCompetitionRunners);

// POST /api/v1/competitions/:competitionId/runners
// Arrangören registrerar löpare till sin egen tävling.
router.post('/:competitionId/runners', requireAuth, validateRunner, registerRunner);

// POST /api/v1/competitions/:competitionId/runners/me
// Inloggad löpare anmäler sig själv till tävlingen.
router.post('/:competitionId/runners/me', requireRunnerAuth, registerCurrentRunnerForCompetition);

export default router;
