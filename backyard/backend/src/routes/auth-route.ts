import { Router } from "express";

import {
  exportCurrentUserData,
  getCurrentSession,
  hardDeleteCurrentUser,
  logout,
  softDeleteCurrentUser,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/auth/me
// Hämtar aktuell session från httpOnly-cookien.
router.get("/me", requireAuth, getCurrentSession);

// GET /api/v1/auth/me/export
// Laddar ner den inloggade användarens egna data i maskinläsbart JSON-format.
router.get("/me/export", requireAuth, exportCurrentUserData);

// DELETE /api/v1/auth/me
// Soft delete: anonymiserar personuppgifter och stänger kontot, men behåller tävlingsstatistik utan identitet.
router.delete("/me", requireAuth, softDeleteCurrentUser);

// DELETE /api/v1/auth/me/hard
// Hard delete: tar bort kontot permanent när det inte äger tävlingar med andra deltagares data.
router.delete("/me/hard", requireAuth, hardDeleteCurrentUser);

// POST /api/v1/auth/logout
// Rensar auth-cookien även om sessionen redan är ogiltig.
router.post("/logout", logout);

export default router;
