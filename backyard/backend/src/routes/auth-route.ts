import { Router } from "express";

import { getCurrentSession, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/auth/me
// Hämtar aktuell session från httpOnly-cookien.
router.get("/me", requireAuth, getCurrentSession);

// POST /api/v1/auth/logout
// Rensar auth-cookien även om sessionen redan är ogiltig.
router.post("/logout", logout);

export default router;
