import { Router } from "express";

import {
  deleteRunner,
  getRunnerById,
  getCurrentRunner,
  listRunners,
  listCurrentRunnerRegistrations,
  loginRunner,
  registerRunnerAccount,
  updateRunner,
} from "../controllers/runnersController";
import { requireAuth, requireRunnerAuth } from "../middleware/auth";
import { validateLogin, validateRunner, validateRunnerAccountRegistration } from "../middleware/validate";

const router = Router();

// GET /api/v1/runners
// Kan filtreras med ?competitionId=1 eller ?status=registered.
router.get('/', listRunners);

// POST /api/v1/runners/register
// Skapar konto för en löpare.
router.post('/register', validateRunnerAccountRegistration, registerRunnerAccount);

// POST /api/v1/runners/login
// Loggar in en löpare.
router.post('/login', validateLogin, loginRunner);

// GET /api/v1/runners/me
router.get('/me', requireRunnerAuth, getCurrentRunner);

// GET /api/v1/runners/me/registrations
router.get('/me/registrations', requireRunnerAuth, listCurrentRunnerRegistrations);

// GET /api/v1/runners/:id
router.get('/:id', getRunnerById);

// PUT /api/v1/runners/:id
// Endast arrangören som äger tävlingen får ändra löparen.
router.put('/:id', requireAuth, validateRunner, updateRunner);

// DELETE /api/v1/runners/:id
// Endast arrangören som äger tävlingen får ta bort löparen.
router.delete('/:id', requireAuth, deleteRunner);

export default router;
