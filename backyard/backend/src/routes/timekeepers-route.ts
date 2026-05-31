import { Router } from "express";

import { becomeTimekeeper } from "../controllers/timekeepersController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/v1/timekeepers/me
// Inloggad användare lägger till tidtagarbehörighet på sitt konto.
router.post("/me", requireAuth, becomeTimekeeper);

export default router;
