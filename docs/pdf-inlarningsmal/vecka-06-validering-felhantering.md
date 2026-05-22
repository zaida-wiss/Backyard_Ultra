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
import HttpError from '../utils/HttpError';

type RequestBody = Record<string, unknown>;

const requireText = (
  body: RequestBody,
  field: string,
  label = field,
): string => {
  const value = body[field];

  if (!value || typeof value !== 'string') {
    throw new HttpError(400, 'BAD_REQUEST', `${label} krävs`);
  }

  return value.trim();
};

export const validateCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as RequestBody;

    req.validatedBody = {
      name: requireText(body, 'name', 'tävlingsnamn'),
      place: requireText(body, 'place', 'plats'),
    };

    return next();
  } catch (error) {
    return next(error);
  }
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
- [ ] Alla fel går via `next(error)`.
- [ ] API:t returnerar konsekvent felformat.
- [ ] Produktionsfel läcker inte stack traces till klienten.
- [ ] Jag kan förklara skillnaden mellan Zod och Mongoose-validering.

