import { Router } from "express";

import {
  createCompetitionForOrganizer,
  deleteCompetition,
  getCompetitionById,
  listCompetitions,
  updateCompetition,
} from "../controllers/competitionsController.js";
import {
  listCompetitionRunners,
  registerCurrentRunnerForCompetition,
  registerRunner,
} from "../controllers/runnersController.js";
import { requireAuth, requireRole, requireRunnerAuth } from "../middleware/auth.js";
import { parseCompetitionFiltersHandler } from "../middleware/competitionFilters.js";
import {
  validateCompetition,
  validateCompetitionIdParam,
  validateIdParam,
  validateRunner,
} from "../middleware/validate.js";

const router = Router();

// GET /api/v1/competitions
// Kan filtreras med ?organizerId=1 eller ?type=Backyard%20Ultra.
router.get("/", parseCompetitionFiltersHandler, listCompetitions);

// POST /api/v1/competitions
// Kräver inloggad arrangör.
router.post(
  "/",
  requireAuth,
  requireRole("organizer", "admin"),
  validateCompetition,
  createCompetitionForOrganizer,
);

// GET /api/v1/competitions/:id
router.get("/:id", validateIdParam, getCompetitionById);

// PUT /api/v1/competitions/:id
router.put(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  validateIdParam,
  validateCompetition,
  updateCompetition,
);

// DELETE /api/v1/competitions/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  validateIdParam,
  deleteCompetition,
);

// GET /api/v1/competitions/:competitionId/runners
router.get("/:competitionId/runners", validateCompetitionIdParam, listCompetitionRunners);

// POST /api/v1/competitions/:competitionId/runners
// Arrangören registrerar löpare till sin egen tävling.
router.post(
  "/:competitionId/runners",
  requireAuth,
  requireRole("organizer", "admin"),
  validateCompetitionIdParam,
  validateRunner,
  registerRunner,
);

// POST /api/v1/competitions/:competitionId/runners/me
// Inloggad löpare anmäler sig själv till tävlingen.
router.post(
  "/:competitionId/runners/me",
  requireRunnerAuth,
  requireRole("runner"),
  validateCompetitionIdParam,
  registerCurrentRunnerForCompetition,
);

export default router;
