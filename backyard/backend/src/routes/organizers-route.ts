import { Router } from "express";

import {
  becomeOrganizer,
  grantAdminRole,
  getCurrentOrganizer,
  loginOrganizer,
  registerOrganizer,
} from "../controllers/organizersController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateIdParam, validateLogin, validateOrganizerRegistration } from "../middleware/validate.js";

const router = Router();

// POST /api/v1/organizers/register
router.post("/register", validateOrganizerRegistration, registerOrganizer);

// POST /api/v1/organizers/login
router.post("/login", validateLogin, loginOrganizer);

// GET /api/v1/organizers/me
router.get("/me", requireAuth, getCurrentOrganizer);

// POST /api/v1/organizers/me
// Inloggad användare lägger till arrangörsbehörighet på sitt konto.
router.post("/me", requireAuth, becomeOrganizer);

// PATCH /api/v1/organizers/:id/admin
// Endast admin får ge admin-behörighet till andra användare.
router.patch("/:id/admin", requireAuth, requireRole("admin"), validateIdParam, grantAdminRole);

export default router;
