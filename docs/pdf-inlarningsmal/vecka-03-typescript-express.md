# Vecka 3: TypeScript i Node.js och Express

## Inlärningsmål

Efter veckan ska du kunna:

- konfigurera TypeScript i ett Node/Express-projekt
- använda `Request`, `Response` och `NextFunction`
- typa request body, params och query
- förstå skillnaden mellan datamodell och API-representation
- använda utility types som `Omit` och `Pick`
- skapa egna felklasser
- använda `unknown` i `catch`

## Nödvändiga paket

```bash
npm install -D typescript tsx @types/node @types/express
```

## Exempel på `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

## JavaScript-exempel

```js
function createRunner(req, res) {
  const runner = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };

  res.status(201).json(runner);
}
```

Problemet: JavaScript hjälper dig inte om `firstName` saknas eller om du stavar fel.

## TypeScript-exempel

```ts
import type { Request, Response, NextFunction } from 'express';

type CreateRunnerBody = {
  firstName: string;
  lastName: string;
  email?: string;
};

export const createRunner = async (
  req: Request<{}, {}, CreateRunnerBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const runner = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email ?? null,
    };

    return res.status(201).json(runner);
  } catch (error: unknown) {
    return next(error);
  }
};
```

## Egna felklasser

```ts
export default class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
```

## Utility type

```ts
type User = {
  id: string;
  email: string;
  passwordHash: string;
};

type PublicUser = Omit<User, 'passwordHash'>;
```

## Checklista

- [ ] Backend kör TypeScript.
- [ ] Alla controllers använder `Request`, `Response`, `NextFunction`.
- [ ] Jag använder `export const namn = async`.
- [ ] Jag har egna typer för body/params/query.
- [ ] Jag använder `Omit` eller `Pick` där det passar.
- [ ] Jag har en egen `HttpError`.

