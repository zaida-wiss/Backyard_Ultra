# Vecka 8: Auktorisering, RBAC och konfiguration

## Inlärningsmål

Efter veckan ska du kunna:

- förklara skillnaden mellan autentisering och auktorisering
- använda roller och behörigheter i ett API
- bygga RBAC-middleware
- spara roller i databasen
- skilja på utvecklings- och produktionskonfiguration
- hantera secrets med `.env`
- beskriva hur frontend, backend och databas pratar med varandra

Autentisering svarar på: vem är du?

Auktorisering svarar på: vad får du göra?

Det är bra att du redan tänker på arrangörer och löpare som olika typer av användare. Det är exakt grunden för RBAC.

## Bygg detta

Bygg roller för:

- `organizer`: får skapa, ändra och ta bort sina egna tävlingar
- `runner`: får se tävlingar och anmäla sig
- `admin`: kan administrera allt om du vill lägga till en extra nivå

## JavaScript-exempel: rollkontroll

```js
function requireRole(role) {
  return function (req, res, next) {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Du saknar behörighet' });
    }

    next();
  };
}

app.post('/api/v1/competitions', requireAuth, requireRole('organizer'), createCompetition);
```

Det fungerar, men JavaScript säger inte till om du råkar skriva `orgnaizer` fel.

## TypeScript-exempel: roller som typ

```ts
export type Role = 'admin' | 'organizer' | 'runner';

export type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
};
```

Nu kan TypeScript stoppa stavfel innan servern körs.

## TypeScript-exempel: RBAC middleware

```ts
import type { Request, Response, NextFunction } from 'express';
import HttpError from '../utils/httpError';
import type { Role } from '../types/domain';

export const requireRole = (...allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(new HttpError(403, 'FORBIDDEN', 'Du saknar behörighet'));
    }

    return next();
  };
};
```

## Använd middleware i route

```ts
router.post(
  '/',
  requireAuth,
  requireRole('organizer', 'admin'),
  validateCompetition,
  createCompetition,
);
```

## Spara roll i databasen

```ts
const organizerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['organizer', 'admin'],
    default: 'organizer',
  },
});
```

## Konfiguration med `.env`

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb+srv://user:password@cluster/database
AUTH_SECRET=byt-ut-mig
CORS_ORIGIN=http://localhost:5173
```

## TypeScript-exempel: config-fil

```ts
const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} saknas i miljövariabler`);
  }

  return value;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  mongoUri: requiredEnv('MONGO_URI'),
  authSecret: requiredEnv('AUTH_SECRET'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};
```

Varför? Om `MONGO_URI` saknas vill du få ett tydligt fel direkt när servern startar, inte ett diffust databasfel senare.

## Frontend, backend och databas

```text
React frontend
  -> fetch('/api/v1/competitions')
  -> Express route
  -> auth/validation middleware
  -> controller
  -> Mongoose model
  -> MongoDB
```

## Frågor att öva på

- Varför räcker det inte att bara gömma knappar i frontend?
- Vilken roll ska få skapa en tävling?
- Vilken roll ska få anmäla sig till en tävling?
- Vad händer om `AUTH_SECRET` byts ut?

## Finns det fler bra lösningar?

Ja. Du kan ha permissions som `competition:create` i stället för roller. Det är mer flexibelt, men också mer kod. För ditt projekt är roller enklare och helt rimligt.

## Checklista

- [ ] Token innehåller användarens roll.
- [ ] Backend kontrollerar roll på skyddade routes.
- [ ] Frontend visar rätt vy för roll.
- [ ] Roller sparas i databasen.
- [ ] `.env` ligger inte i Git.
- [ ] `.env.example` visar alla variabelnamn utan riktiga secrets.
- [ ] Konfiguration läses från en samlad config-fil.
