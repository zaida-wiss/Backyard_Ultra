# Vecka 6: Validering och felhantering

## Inlärningsmål

Efter veckan ska du kunna:

- förklara principen "Don't trust the client"
- validera `body`, `params` och `query`
- förstå manuell validering
- använda Zod för schemas
- skilja på Mongoose-validering och applikationsvalidering
- skapa centraliserad felhantering
- skapa konsekvent felrespons-format

## Bygg detta

Alla endpoints ska ha validering innan controller-logiken körs.

I projektstrukturen ligger ansvaret så här:

```text
schemas/
  competitionSchema.ts
  organizerSchema.ts
  runnerSchema.ts
middleware/
  validate.ts
errors/
  httpError.ts
```

`schemas/` beskriver vad som är giltig input. `validate.ts` kör rätt schema. `errors/` innehåller egna felklasser.

## JavaScript-exempel: manuell validering

```js
function validateCompetition(req, res, next) {
  const { name, place } = req.body;

  if (!name || !place) {
    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'name och place krävs',
        status: 400,
      },
    });
  }

  next();
}
```

## TypeScript-exempel: valideringsmiddleware

```ts
import type { Request, Response, NextFunction } from 'express';
import { parseCompetition } from '../schemas/competitionSchema';

export const validateCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.validatedBody = parseCompetition(req.body);
    return next();
  } catch (error) {
    return next(error);
  }
};
```

## TypeScript-exempel: schemafil

```ts
// src/schemas/competitionSchema.ts
import HttpError from '../errors/httpError';

export const parseCompetition = (body: Record<string, unknown>) => {
  if (typeof body.name !== 'string' || body.name.trim() === '') {
    throw new HttpError(400, 'BAD_REQUEST', 'tävlingsnamn krävs');
  }

  return {
    name: body.name.trim(),
  };
};
```

## Zod-exempel

```ts
import { z } from 'zod';

const createCompetitionSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  place: z.string().min(1),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
});

export const validateCompetitionWithZod = async (req, res, next) => {
  const result = createCompetitionSchema.safeParse(req.body);

  if (!result.success) {
    return next(new HttpError(400, 'VALIDATION_ERROR', 'Ogiltig indata'));
  }

  req.validatedBody = result.data;
  return next();
};
```

## Central error handler

```ts
export const errorHandler = async (error, req, res, next) => {
  const status = error.status || 500;

  return res.status(status).json({
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Något gick fel',
      status,
    },
  });
};
```

## Checklista

- [ ] `body` valideras innan data används.
- [ ] `params` valideras innan id används.
- [ ] `query` valideras innan filtrering.
- [ ] Valideringsregler ligger i `schemas/`.
- [ ] Middleware kör schema och lägger resultatet i `req.validatedBody`.
- [ ] Alla fel går via `next(error)`.
- [ ] API:t returnerar konsekvent felformat.
- [ ] Produktionsfel läcker inte stack traces till klienten.
- [ ] Jag kan förklara skillnaden mellan Zod och Mongoose-validering.
