import { Router } from "express";

import {
  assignTimekeeperToCompetition,
  becomeTimekeeper,
  listMyTimekeeperAssignments,
} from "../controllers/timekeepersController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateCompetitionIdParam } from "../middleware/validate.js";

const router = Router();

// POST /api/v1/timekeepers/me
// Inloggad användare lägger till tidtagarbehörighet på sitt konto.
router.post("/me", requireAuth, becomeTimekeeper);

// GET /api/v1/timekeepers/me/assignments
// Visar tävlingar där den inloggade användaren är funktionär.
router.get("/me/assignments", requireAuth, requireRole("timekeeper"), listMyTimekeeperAssignments);

// POST /api/v1/timekeepers/competitions/:competitionId
// Arrangören lägger till en funktionär på sin tävling via e-post.
router.post(
  "/competitions/:competitionId",
  requireAuth,
  requireRole("organizer", "admin"),
  validateCompetitionIdParam,
  assignTimekeeperToCompetition,
);

export default router;
