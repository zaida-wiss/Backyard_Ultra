import { Router } from "express";

import {
  deleteRunner,
  getRunnerById,
  getCurrentRunner,
  listRunners,
  listCurrentRunnerRegistrations,
  loginRunner,
  registerRunnerAccount,
  updateRunnerLapTimes,
  updateRunner,
} from "../controllers/runnersController.js";
import { requireAuth, requireRole, requireRunnerAuth } from "../middleware/auth.js";
import {
  validateIdParam,
  validateLogin,
  validateRunner,
  validateRunnerAccountRegistration,
  validateRunnerLapTimes,
} from "../middleware/validate.js";

const router = Router();

// GET /api/v1/runners
// Kan filtreras med ?competitionId=1 eller ?status=registered.
router.get("/", listRunners);

// POST /api/v1/runners/register
// Skapar konto för en löpare.
router.post("/register", validateRunnerAccountRegistration, registerRunnerAccount);

// POST /api/v1/runners/login
// Loggar in en löpare.
router.post("/login", validateLogin, loginRunner);

// GET /api/v1/runners/me
router.get("/me", requireRunnerAuth, requireRole("runner"), getCurrentRunner);

// GET /api/v1/runners/me/registrations
router.get(
  "/me/registrations",
  requireRunnerAuth,
  requireRole("runner"),
  listCurrentRunnerRegistrations,
);

// GET /api/v1/runners/:id
router.get("/:id", validateIdParam, getRunnerById);

// PATCH /api/v1/runners/:id/lap-times
// Tidtagare får rapportera tider, men får inte lägga till eller ta bort deltagare.
router.patch(
  "/:id/lap-times",
  requireAuth,
  requireRole("timekeeper", "organizer", "admin"),
  validateIdParam,
  validateRunnerLapTimes,
  updateRunnerLapTimes,
);

// PUT /api/v1/runners/:id
// Endast arrangören som äger tävlingen får ändra löparen.
router.put(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  validateIdParam,
  validateRunner,
  updateRunner,
);

// DELETE /api/v1/runners/:id
// Endast arrangören som äger tävlingen får ta bort löparen.
router.delete(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  validateIdParam,
  deleteRunner,
);

export default router;
