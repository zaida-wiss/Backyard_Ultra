# Workshop: implementera vecka 8 i Backyard Ultra

Den här filen guidar dig steg för steg genom kursvecka 8: auktorisering, RBAC och konfiguration.

Kursmaterialet finns här:

- `docs/pdf-inlarningsmal/vecka-08-rbac-konfiguration.md`

Arbeta så här:

1. Läs frågan först.
2. Försök svara själv.
3. Öppna filen och raden som nämns.
4. Skriv av TypeScript-exemplet.
5. Kör `npm run build`.
6. Kör `npm test`.

Du har redan gjort mycket rätt: token innehåller roll, projektet har arrangörs-auth och löpar-auth, och skyddade routes finns. Vecka 8 handlar om att göra detta tydligare och mer flexibelt med RBAC, roller i databasen och samlad konfiguration.

## Målet

Efter implementationen ska projektet ha:

- en tydlig rolltyp: `admin`, `organizer`, `runner`
- roller sparade i MongoDB
- generell RBAC-middleware: `requireRole(...)`
- tydlig skillnad mellan autentisering och auktorisering
- samlad config-fil för `.env`
- `.env.example` som visar vilka variabler projektet kräver

## Begreppen

### Fråga

Vad är skillnaden mellan autentisering och auktorisering?

Försök svara själv.

Svar:

- Autentisering: vem är du?
- Auktorisering: vad får du göra?

Exempel:

```text
Token verifieras
  -> autentisering

Backend kontrollerar om rollen får skapa tävling
  -> auktorisering
```

Varför är detta viktigt? Om du bara vet vem användaren är, men inte kontrollerar vad användaren får göra, kan en inloggad löpare försöka göra arrangörssaker.

## Nuvarande status i projektet

| Område | Fil | Nuvarande rad | Status |
| --- | --- | ---: | --- |
| Rolltyp | `backyard/backend/src/types/domain.ts` | 84 | Har `organizer` och `runner`, men saknar `admin`. |
| Token payload | `backyard/backend/src/types/domain.ts` | 86 | Har `role`, bra grund. |
| Express request | `backyard/backend/src/types/express.d.ts` | 6 | Har `organizer` och `runnerAccount`, men saknar generell `authUser`. |
| Auth middleware | `backyard/backend/src/middleware/auth.ts` | 18 | Har separata kontroller, men ingen generell `requireRole`. |
| Organizer model | `backyard/backend/src/models/organizer.model.ts` | 8 | Sparar inte roll i databasen ännu. |
| Runner account model | `backyard/backend/src/models/runnerAccount.model.ts` | 8 | Sparar inte roll i databasen ännu. |
| Competition routes | `backyard/backend/src/routes/competitions-route.ts` | 27 | Skyddar med `requireAuth`, men visar inte RBAC tydligt. |
| Config | `backyard/backend/src/config/database.ts` | 3 | Läser `MONGO_URI` direkt från `process.env`. |
| Auth secret | `backyard/backend/src/utils/security.ts` | 13 | Läser `AUTH_SECRET` direkt i utility. |

## Steg 1: uppdatera rolltyper

### Öppna fil

`backyard/backend/src/types/domain.ts`

Nuvarande viktig rad:

- rad 84: `export type AuthRole = "organizer" | "runner";`

### Fråga

Vad händer om du råkar skriva `"orgnaizer"` någonstans i koden?

Svar: om rollerna är typade kan TypeScript stoppa stavfelet innan servern körs.

### Kod att skriva

Byt rolltypen och lägg till en generell inloggad användare.

```ts
export type AuthRole = "admin" | "organizer" | "runner";

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
};

export type TokenPayload = {
  sub: string;
  email: string;
  role: AuthRole;
  exp: number;
};
```

Lägg också till `role` på publika användartyperna.

```ts
export type Organizer = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "organizer";
  createdAt: string;
  updatedAt: string;
};

export type RunnerAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  club: string | null;
  role: "runner";
  createdAt: string;
  updatedAt: string;
};
```

### Varför?

Rollerna blir en del av domänen. Då kan controller, middleware och token använda samma språk.

### Alternativ

Du kan ha permissions som `competition:create` och `competition:delete` i stället för roller. Det är mer flexibelt, men mer kod. För ditt projekt är RBAC med roller enklare och helt rätt för vecka 8.

## Steg 2: spara roller i databasen

### Öppna fil

`backyard/backend/src/models/organizer.model.ts`

Nuvarande viktig rad:

- rad 18: `passwordHash`

### Kod att skriva

Lägg till `role` i `organizerSchema`.

```ts
const organizerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    // Rollen sparas i databasen så backend kan fatta beslut
    // även om frontend försöker dölja eller manipulera något.
    role: {
      type: String,
      enum: ["admin", "organizer"],
      default: "organizer",
      required: true,
    },
  },
  { timestamps: true },
);
```

Uppdatera `toPublicOrganizer`.

```ts
export const toPublicOrganizer = (organizer: OrganizerDocument) => {
  return {
    id: organizer.id,
    name: organizer.name,
    email: organizer.email,
    role: organizer.role,
    createdAt: organizer.createdAt.toISOString(),
    updatedAt: organizer.updatedAt.toISOString(),
  };
};
```

### Öppna fil

`backyard/backend/src/models/runnerAccount.model.ts`

Nuvarande viktig rad:

- rad 20: `club`

### Kod att skriva

Lägg till `role` i `runnerAccountSchema`.

```ts
const runnerAccountSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    club: { type: String, default: null, trim: true },
    // Löparkonton ska alltid ha rollen runner.
    role: {
      type: String,
      enum: ["runner"],
      default: "runner",
      required: true,
    },
  },
  { timestamps: true },
);
```

Uppdatera `toPublicRunnerAccount`.

```ts
export const toPublicRunnerAccount = (runnerAccount: RunnerAccountDocument) => {
  return {
    id: runnerAccount.id,
    firstName: runnerAccount.firstName,
    lastName: runnerAccount.lastName,
    email: runnerAccount.email,
    club: runnerAccount.club ?? null,
    role: runnerAccount.role,
    createdAt: runnerAccount.createdAt.toISOString(),
    updatedAt: runnerAccount.updatedAt.toISOString(),
  };
};
```

### Varför?

Backend ska inte lita på att frontend säger rätt roll. Rollen måste komma från serverns databas eller från en token som servern själv har skapat.

## Steg 3: lägg till generell authUser på request

### Öppna fil

`backyard/backend/src/types/express.d.ts`

Nuvarande viktiga rader:

- rad 7: `organizer?: PublicOrganizer;`
- rad 8: `runnerAccount?: PublicRunnerAccount;`

### Kod att skriva

Lägg till `AuthUser`.

```ts
import type { AuthUser, PublicOrganizer, PublicRunnerAccount } from "./domain";
import type { CompetitionFilters } from "../schemas/competitionFiltersSchema";

declare global {
  namespace Express {
    interface Request {
      // authUser är den generella inloggade användaren.
      // RBAC-middleware behöver bara veta id, email och role.
      authUser?: AuthUser;
      organizer?: PublicOrganizer;
      runnerAccount?: PublicRunnerAccount;
      validatedBody?: unknown;
      competitionFilters?: CompetitionFilters;
    }
  }
}

export {};
```

### Varför?

`requireRole("organizer")` ska inte behöva bry sig om användaren är en hel `Organizer` eller `RunnerAccount`. Den behöver bara rollen.

## Steg 4: skapa RBAC-middleware

### Öppna fil

`backyard/backend/src/middleware/auth.ts`

Nuvarande viktiga rader:

- rad 18: `requireAuth`
- rad 44: `requireRunnerAuth`

### Fråga

Varför är det bättre med `requireRole("organizer", "admin")` än att bara ha en hårdkodad `requireAuth`?

Svar: det blir tydligare i route-filen exakt vilka roller som får göra vad.

### Kod att skriva

Uppdatera importen.

```ts
import type { AuthRole } from "../types/domain";
```

Lägg till `requireRole`.

```ts
export const requireRole = (...allowedRoles: AuthRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userRole = req.authUser?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new HttpError(403, "FORBIDDEN", "Du saknar behörighet");
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
```

Uppdatera `requireAuth` så den sätter `req.authUser`.

```ts
export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      throw new HttpError(401, "UNAUTHORIZED", "Token saknas eller är ogiltig");
    }

    if (payload.role !== "organizer" && payload.role !== "admin") {
      throw new HttpError(403, "FORBIDDEN", "Du måste vara inloggad som arrangör");
    }

    const organizer = await OrganizerModel.findById(payload.sub);

    if (!organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Arrangören finns inte längre");
    }

    const publicOrganizer = toPublicOrganizer(organizer);

    req.authUser = {
      id: publicOrganizer.id,
      email: publicOrganizer.email,
      role: publicOrganizer.role,
    };
    req.organizer = publicOrganizer;

    return next();
  } catch (error) {
    return next(error);
  }
};
```

Uppdatera `requireRunnerAuth` på samma sätt.

```ts
export const requireRunnerAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      throw new HttpError(401, "UNAUTHORIZED", "Token saknas eller är ogiltig");
    }

    if (payload.role !== "runner") {
      throw new HttpError(403, "FORBIDDEN", "Du måste vara inloggad som löpare");
    }

    const runnerAccount = await RunnerAccountModel.findById(payload.sub);

    if (!runnerAccount) {
      throw new HttpError(401, "UNAUTHORIZED", "Löparkontot finns inte längre");
    }

    const publicRunnerAccount = toPublicRunnerAccount(runnerAccount);

    req.authUser = {
      id: publicRunnerAccount.id,
      email: publicRunnerAccount.email,
      role: publicRunnerAccount.role,
    };
    req.runnerAccount = publicRunnerAccount;

    return next();
  } catch (error) {
    return next(error);
  }
};
```

### Varför?

Det här gör två saker:

- `requireAuth` och `requireRunnerAuth` autentiserar användaren.
- `requireRole` auktoriserar vad användaren får göra.

Det är exakt skillnaden vecka 8 vill att du ska förstå.

## Steg 5: använd RBAC i routes

### Öppna fil

`backyard/backend/src/routes/competitions-route.ts`

Nuvarande viktiga rader:

- rad 15: importerar `requireAuth`
- rad 27: skapar tävling
- rad 33: uppdaterar tävling
- rad 36: tar bort tävling
- rad 43: arrangör registrerar löpare

### Kod att skriva

Uppdatera importen.

```ts
import { requireAuth, requireRole, requireRunnerAuth } from "../middleware/auth";
```

Uppdatera skyddade routes.

```ts
router.post(
  "/",
  requireAuth,
  requireRole("organizer", "admin"),
  validateCompetition,
  createCompetitionForOrganizer,
);

router.put(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  validateCompetition,
  updateCompetition,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  deleteCompetition,
);

router.post(
  "/:competitionId/runners",
  requireAuth,
  requireRole("organizer", "admin"),
  validateRunner,
  registerRunner,
);
```

### Varför?

När du läser route-filen ska du kunna se behörigheten direkt:

```text
POST /competitions
  -> kräver inloggning
  -> kräver organizer eller admin
  -> validerar body
  -> kör controller
```

### Viktigt om admin

Just nu kontrollerar `competitionsController.ts` ägarskap med:

- rad 40: `requireCompetitionOwner`
- rad 159: används vid update
- rad 183: används vid delete

Om `admin` ska få ändra allt behöver du justera ägarskapskontrollen.

## Steg 6: låt admin passera ägarskapskontroll

### Öppna fil

`backyard/backend/src/controllers/competitionsController.ts`

Nuvarande viktig funktion:

- rad 40: `requireCompetitionOwner`

### Fråga

Ska en admin behöva äga tävlingen för att få ändra den?

Rimligt svar: nej, admin kan få administrera allt.

### Kod att skriva

Byt funktionen till:

```ts
export const requireCompetitionOwner = (
  competition: CompetitionDocument,
  user: { id: string; role: "admin" | "organizer" },
) => {
  // Admin får administrera alla tävlingar.
  if (user.role === "admin") {
    return;
  }

  if (competition.organizerId.toString() !== user.id) {
    throw new HttpError(403, "FORBIDDEN", "Du kan bara ändra dina egna tävlingar");
  }
};
```

Uppdatera anropen i samma fil.

```ts
requireCompetitionOwner(competition, {
  id: req.organizer.id,
  role: req.organizer.role,
});
```

Det gäller ungefär:

- rad 159 i `updateCompetition`
- rad 183 i `deleteCompetition`

### Glöm inte runnersController

`backyard/backend/src/controllers/runnersController.ts` använder också `requireCompetitionOwner`.

Sök i filen efter:

```ts
requireCompetitionOwner(
```

Uppdatera varje anrop på samma sätt.

### Varför?

Annars får `admin` rollen i route-filen, men stoppas senare av ägarskapskontrollen i controllern. Det är en vanlig RBAC-miss: route säger ja, controller säger nej.

## Steg 7: skapa samlad config-fil

### Skapa fil

`backyard/backend/src/config/env.ts`

### Fråga

Varför vill vi hellre krascha direkt vid start om `MONGO_URI` saknas?

Svar: då får du ett tydligt fel direkt, i stället för ett diffust databasfel senare när en request kommer in.

### Kod att skriva

```ts
const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} saknas i miljövariablerna`);
  }

  return value;
};

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`${value} är inte ett giltigt nummer`);
  }

  return parsedValue;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 3000),
  mongoUri: requiredEnv("MONGO_URI"),
  authSecret: requiredEnv("AUTH_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
```

### Varför?

Nu finns miljövariablerna på ett ställe. Det blir lättare att se vad projektet kräver i development och produktion.

## Steg 8: använd config i database.ts

### Öppna fil

`backyard/backend/src/config/database.ts`

Nuvarande viktiga rader:

- rad 4: `process.env.MONGO_URI`

### Kod att skriva

```ts
import mongoose from "mongoose";
import { config } from "./env";

export const connectToDatabase = async () => {
  await mongoose.connect(config.mongoUri);
  console.log("Ansluten till MongoDB");
};
```

### Varför?

`database.ts` ska inte själv behöva veta hur miljövariabler valideras. Den ska bara använda färdig config.

## Steg 9: använd config i server.ts

### Öppna fil

`backyard/backend/src/server.ts`

Sök efter:

```ts
const PORT = Number(process.env.PORT) || 3000;
```

### Kod att skriva

```ts
import "dotenv/config";
import app from "./app";
import { config } from "./config/env";
import { connectToDatabase } from "./config/database";

const startServer = async () => {
  try {
    await connectToDatabase();

    app.listen(config.port, () => {
      console.log(`Servern körs på http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Kunde inte starta servern:", error);
    process.exit(1);
  }
};

startServer();
```

### Varför?

Servern får sin port från samma config-system som resten av projektet.

## Steg 10: använd config i security.ts

### Öppna fil

`backyard/backend/src/utils/security.ts`

Nuvarande viktiga rader:

- rad 13: `getAuthSecret`
- rad 37: `getAuthSecret()`
- rad 44: `getAuthSecret()`

### Kod att skriva

```ts
import { config } from "../config/env";
```

Byt ut `getAuthSecret()` och använd:

```ts
export const createToken = (user: TokenUser, role: AuthRole): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role,
    },
    config.authSecret,
    { expiresIn: TOKEN_TTL },
  );
};
```

Och:

```ts
const payload = jwt.verify(token, config.authSecret);
```

### Viktigt om tester

Din testfil sätter idag:

```ts
process.env.AUTH_SECRET = "test-secret";
```

Det måste ske innan moduler som importerar `config` laddas, annars läser config filen miljön för tidigt.

En enkel lösning i testfilen är att sätta miljövariabler högst upp innan appen importeras. Om det blir svårt kan du vänta med att flytta `AUTH_SECRET` till config tills du samtidigt refaktorerar testsetupen.

Det här är en bra sak att öva på: config läses när modulen importeras.

## Steg 11: uppdatera .env.example

### Öppna fil

`backyard/backend/.env.example`

Nuvarande viktiga rader:

- rad 1: `AUTH_SECRET`
- rad 3: `PORT`
- rad 4: `CORS_ORIGIN`
- rad 5: `NODE_ENV`
- rad 6: `MONGO_URI`

### Kod att skriva

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
AUTH_SECRET=byt-ut-mig-till-en-lang-slumpad-hemlighet
MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

### Varför?

`.env.example` ska visa vilka variabler som behövs, men aldrig innehålla riktiga secrets.

## Steg 12: uppdatera tester för roller

### Öppna fil

`backyard/backend/src/__tests__/app.test.ts`

### Fråga

Vilket test visar att backend faktiskt kontrollerar roll, inte bara att frontend gömmer en knapp?

Svar: ett API-test där en löpare försöker skapa en tävling och ska få `403`.

### Kod att skriva

Lägg till ett test:

```ts
it("prevents a runner from creating a competition", async () => {
  const registerResponse = await request("/api/v1/runners/register", {
    method: "POST",
    body: JSON.stringify({
      firstName: "Fel",
      lastName: "Roll",
      email: "fel.roll@example.com",
      password: "password123",
      club: "Testklubben",
    }),
  });

  assert.equal(registerResponse.status, 201);
  const registerBody = await registerResponse.json();

  const response = await request("/api/v1/competitions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${registerBody.token}`,
    },
    body: JSON.stringify({
      name: "Otillåten tävling",
      type: "Backyard Ultra",
      place: "Malmö",
      startAt: "2026-09-01T09:00",
      endAt: "2026-09-02T17:00",
    }),
  });

  assert.equal(response.status, 403);
});
```

### Varför?

Det här testet bevisar RBAC. Det räcker inte att frontend inte visar knappen. Backend måste stoppa requesten.

## Steg 13: frontend, backend och databas

Det här behöver du kunna förklara:

```text
React frontend
  -> skickar token i Authorization-header
  -> Express route
  -> auth middleware verifierar token
  -> RBAC middleware kontrollerar roll
  -> controller kontrollerar ägarskap
  -> Mongoose model
  -> MongoDB
```

### Fråga

Varför finns både `requireRole("organizer", "admin")` och `requireCompetitionOwner(...)`?

Svar:

- `requireRole` svarar: har användaren rätt typ av roll?
- `requireCompetitionOwner` svarar: får just den här användaren ändra just den här tävlingen?

Det är två olika säkerhetslager.

## Rekommenderad ordning

1. Uppdatera `types/domain.ts`.
2. Uppdatera `models/organizer.model.ts`.
3. Uppdatera `models/runnerAccount.model.ts`.
4. Uppdatera `types/express.d.ts`.
5. Uppdatera `middleware/auth.ts`.
6. Uppdatera `routes/competitions-route.ts`.
7. Uppdatera `controllers/competitionsController.ts`.
8. Uppdatera `controllers/runnersController.ts`.
9. Skapa `config/env.ts`.
10. Uppdatera `config/database.ts`.
11. Uppdatera `server.ts`.
12. Uppdatera `utils/security.ts`.
13. Uppdatera `.env.example`.
14. Lägg till RBAC-test.
15. Kör build och tester.

## Kör kontroller

```bash
cd backyard/backend
npm run build
npm test
```

Om TypeScript stoppar dig, läs felet så här:

```text
Vilken fil skapar värdet?
Vilken fil bestämmer typen?
Vilken roll saknas?
Är detta autentisering eller auktorisering?
```

## Checklista vecka 8

- [ ] Jag kan förklara skillnaden mellan autentisering och auktorisering.
- [ ] `AuthRole` innehåller `admin`, `organizer` och `runner`.
- [ ] Token innehåller roll.
- [ ] Roller sparas i MongoDB.
- [ ] `req.authUser` finns i Express-typen.
- [ ] `requireRole(...)` finns.
- [ ] Skyddade routes visar vilka roller som får använda dem.
- [ ] Admin kan hanteras tydligt.
- [ ] Ägarskap kontrolleras i controller.
- [ ] Config läses från en samlad config-fil.
- [ ] `.env.example` visar alla variabelnamn utan riktiga secrets.
- [ ] Det finns test som visar att fel roll får `403`.

## Det viktigaste att ta med sig

Det centrala i vecka 8 är inte bara att "ha roller". Det viktiga är att förstå var varje beslut tas:

```text
Token
  -> vem är användaren?

Role middleware
  -> får rollen använda route:n?

Controller
  -> får användaren ändra just den här resursen?

Config
  -> vilka värden styr appen i olika miljöer?
```

När du kan förklara den kedjan har du förstått vecka 8 på riktigt. Bra jobbat att du bygger vidare stegvis; det här är precis hur backend går från "fungerar" till "är strukturerad och säker".
