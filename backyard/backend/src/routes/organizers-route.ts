import { Router } from "express";

import {
  getCurrentOrganizer,
  loginOrganizer,
  registerOrganizer,
} from "../controllers/organizersController";
import { requireAuth } from "../middleware/auth";
import { validateLogin, validateOrganizerRegistration } from "../middleware/validate";

const router = Router();

// POST /api/v1/organizers/register
router.post('/register', validateOrganizerRegistration, registerOrganizer);

// POST /api/v1/organizers/login
router.post('/login', validateLogin, loginOrganizer);

// GET /api/v1/organizers/me
router.get('/me', requireAuth, getCurrentOrganizer);

export default router;
