# Vecka 2: REST API-design, struktur och middleware

## Inlärningsmål

Efter veckan ska du kunna:

- designa resurser och URL:er
- använda HTTP-metoder semantiskt
- strukturera ett Express-projekt
- skapa router-moduler
- använda egen middleware
- skapa konsekvent felformat
- versionshantera API:et med `/api/v1`
- testa API:et med Postman eller Thunder Client

## Bygg detta

Strukturera API:t i filer:

```text
src/
  app.ts
  server.ts
  routes/
    competitions.ts
  controllers/
    competitionsController.ts
  middleware/
    errorHandler.ts
```

## JavaScript-exempel: router

```js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([]);
});

router.post('/', (req, res) => {
  res.status(201).json(req.body);
});

module.exports = router;
```

## TypeScript-exempel: router

```ts
import { Router } from 'express';
import {
  createCompetition,
  listCompetitions,
} from '../controllers/competitionsController';

const router = Router();

router.get('/', listCompetitions);
router.post('/', createCompetition);

export default router;
```

## TypeScript-exempel: controller

```ts
import type { Request, Response, NextFunction } from 'express';

export const listCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.json([]);
  } catch (error) {
    return next(error);
  }
};
```

## TypeScript-exempel: felhantering

```ts
import type { Request, Response, NextFunction } from 'express';

export const notFoundHandler = async (req: Request, res: Response) => {
  return res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Sökvägen ${req.path} finns inte`,
      status: 404,
    },
  });
};

export const errorHandler = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Något gick fel på servern',
      status: 500,
    },
  });
};
```

## Checklista

- [ ] Routes ligger i `routes/`.
- [ ] Controllers ligger i `controllers/`.
- [ ] Appen använder `/api/v1`.
- [ ] Okända routes ger `404`.
- [ ] Fel returneras i samma format varje gång.
- [ ] Jag kan testa mina endpoints i Thunder Client/Postman.

