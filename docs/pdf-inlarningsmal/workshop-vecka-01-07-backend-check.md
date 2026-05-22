# Workshop: fixa backend så den motsvarar vecka 1-7

Den här filen guidar dig genom vad som redan är bra i Backyard Ultra-backenden och vad du behöver uppdatera för att implementationen tydligare ska motsvara kursens vecka 1-7.

Arbeta så här:

1. Läs frågan först.
2. Försök svara själv.
3. Öppna filen som nämns.
4. Skriv av kodexemplet.
5. Kör `npm run build` och sedan testerna.
6. Markera checklistan när du kan förklara varför ändringen behövs.

Du har redan gjort mycket rätt: projektet har Express, routes, controllers, TypeScript, validering, felhantering, auth, filtrering och tester. Det viktigaste som saknas är att vissa delar fortfarande bara använder in-memory arrays i `data/store.ts`.

## Snabb bild

| Vecka | Område | Status | Viktigaste fix |
| --- | --- | --- | --- |
| 1 | Node.js och Express | Nästan klart | Behåll uppdelningen `app.ts` och `server.ts`. |
| 2 | REST, routes och middleware | Nästan klart | Kontrollera att alla routes går via `/api/v1`. |
| 3 | TypeScript | Nästan klart | Byt id-typer från `number` till `string` när MongoDB används. |
| 4 | MongoDB och Mongoose | Måste fixas | Skapa riktiga Mongoose models och använd dem i controllers. |
| 5 | Relationer, filter och testning | Delvis klart | Låt relationer och filter fungera mot MongoDB. |
| 6 | Validering och felhantering | Nästan klart | Behåll validering före controllers och central error handler. |
| 7 | Säkerhet, lösenord och token | Delvis klart | Byt egen crypto-token till `bcrypt` och `jsonwebtoken`. |

## Det största gapet

Fråga till dig: om en controller gör detta, var sparas datan?

```ts
competitions.push(competition);
```

Svar: i serverns minne, inte i MongoDB.

Det är viktigt eftersom data i minnet försvinner när servern startar om. MongoDB behövs för att datan ska finnas kvar.

## Filer du främst ska uppdatera

| Fil | Varför |
| --- | --- |
| `backyard/backend/package.json` | Lägg till bibliotek för bcrypt, JWT och testdatabas. |
| `backyard/backend/src/types/domain.ts` | Anpassa typer till MongoDB-id som är strängar. |
| `backyard/backend/src/models/competition.model.ts` | Skapa riktig Mongoose model. |
| `backyard/backend/src/models/organizer.model.ts` | Skapa riktig Mongoose model för arrangörer. |
| `backyard/backend/src/models/runner.model.ts` | Skapa riktig Mongoose model för anmälningar/löpare. |
| `backyard/backend/src/models/runnerAccount.model.ts` | Skapa riktig Mongoose model för löparkonton. |
| `backyard/backend/src/controllers/competitionsController.ts` | Läs och skriv tävlingar via MongoDB. |
| `backyard/backend/src/controllers/organizersController.ts` | Registrera och logga in arrangörer via MongoDB. |
| `backyard/backend/src/controllers/runnersController.ts` | Registrera löparkonton och anmälningar via MongoDB. |
| `backyard/backend/src/middleware/auth.ts` | Hämta inloggad användare från MongoDB. |
| `backyard/backend/src/utils/security.ts` | Använd bcrypt och JWT. |
| `backyard/backend/src/__tests__/app.test.ts` | Testa mot en testdatabas, inte mot arrays. |

## Installera paket

Öppna terminalen:

```bash
cd backyard/backend
npm install bcrypt jsonwebtoken
npm install -D @types/bcrypt @types/jsonwebtoken mongodb-memory-server
```

Varför? `bcrypt` används för lösenord, `jsonwebtoken` för token och `mongodb-memory-server` gör att tester kan köra mot en tillfällig MongoDB-databas.

Alternativ: du kan använda Node `crypto`, som projektet redan gör, men kursmålet blir tydligare om du visar att du kan använda vanliga bibliotek som `bcrypt` och JWT.

## Vecka 1: Express och startflöde

### Fråga

Varför är det bra att ha både `app.ts` och `server.ts`?

Ledtråd: vilken fil vill testerna importera utan att servern börjar lyssna på en fast port?

### Status i ditt projekt

Det här är redan bra:

- `backyard/backend/src/app.ts` skapar Express-appen.
- `backyard/backend/src/server.ts` startar servern.
- `app.ts` exporteras så tester kan importera appen.

### Kontrollkod

Din `app.ts` ska fortsätta se ut ungefär så här:

```ts
import cors from "cors";
import express from "express";
import morgan from "morgan";

import competitionsRouter from "./routes/competitions-route";
import organizersRouter from "./routes/organizers-route";
import runnersRouter from "./routes/runners-route";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/organizers", organizersRouter);
app.use("/api/v1/competitions", competitionsRouter);
app.use("/api/v1/runners", runnersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
```

Varför? Utan `express.json()` kan backend inte läsa JSON från request body. Utan export av `app` blir tester svårare.

Bra jobbat här: du har redan den viktiga uppdelningen på plats. Öva på att kunna säga högt vad varje fil ansvarar för.

## Vecka 2: REST, routes och middleware

### Fråga

Vilken ordning går en request genom?

```text
POST /api/v1/competitions
```

Försök svara innan du läser vidare.

### Rimlig ordning

```text
app.ts
  -> routes/competitions-route.ts
  -> middleware/auth.ts
  -> middleware/validate.ts
  -> schemas/competitionSchema.ts
  -> controllers/competitionsController.ts
  -> models/MongoDB
  -> response till klienten

Om något går fel:
  -> middleware/errorHandler.ts
```

### Kontrollkod

Din `backyard/backend/src/routes/competitions-route.ts` är redan på rätt väg:

```ts
router.get("/", parseCompetitionFiltersHandler, listCompetitions);
router.post("/", requireAuth, validateCompetition, createCompetitionForOrganizer);
router.get("/:id", getCompetitionById);
router.put("/:id", requireAuth, validateCompetition, updateCompetition);
router.delete("/:id", requireAuth, deleteCompetition);
```

Varför? Route-filen ska bara bestämma URL, HTTP-metod och vilken middleware/controller som ska köras. Den ska inte innehålla databaskod.

Alternativ: man kan lägga allt i route-filen i ett litet demo-projekt, men i ett kursprojekt är uppdelningen bättre eftersom du visar ansvarsfördelning.

## Vecka 3: TypeScript och domäntyper

### Fråga

Varför ska MongoDB-id ofta vara `string` i dina TypeScript-typer?

Ledtråd: vad får klienten tillbaka när ett Mongoose `_id` skickas som JSON?

### Uppdatera fil

Fil: `backyard/backend/src/types/domain.ts`

När du går över till MongoDB bör dina publika id-typer vara `string`, inte `number`.

Skriv om centrala typer ungefär så här:

```ts
export type Organizer = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicOrganizer = Omit<Organizer, "passwordHash">;

export type RunnerAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  club: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicRunnerAccount = Omit<RunnerAccount, "passwordHash">;

export type Competition = {
  id: string;
  organizerId: string;
  name: string;
  type: string;
  place: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
};

export type RunnerStatus = "registered";

export type Runner = {
  id: string;
  competitionId: string;
  runnerAccountId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  club: string | null;
  status: RunnerStatus;
  createdAt: string;
  updatedAt: string;
};

export type AuthRole = "organizer" | "runner";

export type TokenPayload = {
  sub: string;
  email: string;
  role: AuthRole;
  exp: number;
};
```

Varför? Om TypeScript fortfarande tror att `id` är `number`, men MongoDB skickar strängar, får du fel längre fram i controllers och auth.

Alternativ: du kan låta Mongoose jobba med `Types.ObjectId` internt och konvertera till `string` när du skickar JSON. Det är ofta bästa lösningen.

## Vecka 4: MongoDB och Mongoose

Det här är den största praktiska uppdateringen.

### Fråga

Vad är skillnaden mellan de här två filtyperna?

```text
schemas/competitionSchema.ts
models/competition.model.ts
```

Svar:

- `schemas/competitionSchema.ts` validerar data från klienten.
- `models/competition.model.ts` beskriver hur data sparas i MongoDB.

Du har förstått något viktigt om du kan hålla isär de två.

### Uppdatera Competition model

Fil: `backyard/backend/src/models/competition.model.ts`

Ersätt factory-funktionen med en riktig Mongoose model:

```ts
import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const competitionSchema = new Schema(
  {
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    place: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export type CompetitionFields = InferSchemaType<typeof competitionSchema>;
export type CompetitionDocument = HydratedDocument<CompetitionFields>;

export const CompetitionModel = model("Competition", competitionSchema);

export const toCompetitionResponse = (competition: CompetitionDocument) => {
  return {
    id: competition.id,
    organizerId: competition.organizerId.toString(),
    name: competition.name,
    type: competition.type,
    place: competition.place,
    startAt: competition.startAt.toISOString(),
    endAt: competition.endAt.toISOString(),
    createdAt: competition.createdAt.toISOString(),
    updatedAt: competition.updatedAt.toISOString(),
  };
};
```

Varför? Mongoose behöver `Schema` och `model` för att veta vilken collection som ska användas och vilka fält som krävs.

### Uppdatera Organizer model

Fil: `backyard/backend/src/models/organizer.model.ts`

```ts
import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

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
  },
  { timestamps: true },
);

export type OrganizerFields = InferSchemaType<typeof organizerSchema>;
export type OrganizerDocument = HydratedDocument<OrganizerFields>;

export const OrganizerModel = model("Organizer", organizerSchema);

export const toPublicOrganizer = (organizer: OrganizerDocument) => {
  return {
    id: organizer.id,
    name: organizer.name,
    email: organizer.email,
    createdAt: organizer.createdAt.toISOString(),
    updatedAt: organizer.updatedAt.toISOString(),
  };
};
```

### Uppdatera RunnerAccount model

Fil: `backyard/backend/src/models/runnerAccount.model.ts`

```ts
import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

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
  },
  { timestamps: true },
);

export type RunnerAccountFields = InferSchemaType<typeof runnerAccountSchema>;
export type RunnerAccountDocument = HydratedDocument<RunnerAccountFields>;

export const RunnerAccountModel = model("RunnerAccount", runnerAccountSchema);

export const toPublicRunnerAccount = (runnerAccount: RunnerAccountDocument) => {
  return {
    id: runnerAccount.id,
    firstName: runnerAccount.firstName,
    lastName: runnerAccount.lastName,
    email: runnerAccount.email,
    club: runnerAccount.club,
    createdAt: runnerAccount.createdAt.toISOString(),
    updatedAt: runnerAccount.updatedAt.toISOString(),
  };
};
```

### Uppdatera Runner model

Fil: `backyard/backend/src/models/runner.model.ts`

```ts
import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const runnerSchema = new Schema(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    runnerAccountId: {
      type: Schema.Types.ObjectId,
      ref: "RunnerAccount",
      default: null,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    club: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: ["registered"],
      default: "registered",
    },
  },
  { timestamps: true },
);

export type RunnerFields = InferSchemaType<typeof runnerSchema>;
export type RunnerDocument = HydratedDocument<RunnerFields>;

export const RunnerModel = model("Runner", runnerSchema);

export const toRunnerResponse = (runner: RunnerDocument) => {
  return {
    id: runner.id,
    competitionId: runner.competitionId.toString(),
    runnerAccountId: runner.runnerAccountId?.toString() ?? null,
    firstName: runner.firstName,
    lastName: runner.lastName,
    email: runner.email,
    club: runner.club,
    status: runner.status,
    createdAt: runner.createdAt.toISOString(),
    updatedAt: runner.updatedAt.toISOString(),
  };
};
```

Varför? Relationer i MongoDB sparas ofta som ObjectId-referenser. Det gör att en tävling kan kopplas till en arrangör och en anmälan kan kopplas till en tävling.

Alternativ: du kan använda ren MongoDB driver utan Mongoose. Det är också en bra lösning, men Mongoose passar kursmålet bättre eftersom du tränar på schemas och models.

## Vecka 4 fortsättning: controllers ska använda MongoDB

### Uppdatera competitionsController

Fil: `backyard/backend/src/controllers/competitionsController.ts`

Målet är att ta bort beroendet till `competitions` arrayen och använda `CompetitionModel`.

Skriv först hjälpfunktioner:

```ts
import type { NextFunction, Request, Response } from "express";
import { Types, type FilterQuery } from "mongoose";

import {
  CompetitionModel,
  type CompetitionFields,
  toCompetitionResponse,
} from "../models/competition.model";
import { RunnerModel } from "../models/runner.model";
import type { ValidatedCompetitionBody } from "../schemas/competitionSchema";
import type { CompetitionFilters } from "../schemas/competitionFiltersSchema";
import HttpError from "../errors/httpError";

const toDate = (value: string) => new Date(value);

const getCompetitionOrThrow = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpError(404, "COMPETITION_NOT_FOUND", "Tävlingen finns inte");
  }

  const competition = await CompetitionModel.findById(id);

  if (!competition) {
    throw new HttpError(404, "COMPETITION_NOT_FOUND", "Tävlingen finns inte");
  }

  return competition;
};

const requireCompetitionOwner = (organizerId: string, currentOrganizerId: string) => {
  if (organizerId !== currentOrganizerId) {
    throw new HttpError(403, "FORBIDDEN", "Du kan bara ändra dina egna tävlingar");
  }
};

const buildCompetitionQuery = (
  filters: CompetitionFilters,
): FilterQuery<CompetitionFields> => {
  const query: FilterQuery<CompetitionFields> = {};

  if (filters.organizerId) {
    query.organizerId = new Types.ObjectId(filters.organizerId);
  }

  if (filters.type) {
    query.type = new RegExp(filters.type, "i");
  }

  if (filters.place) {
    query.place = new RegExp(filters.place, "i");
  }

  if (filters.startsAfter) {
    query.startAt = { ...(query.startAt ?? {}), $gte: new Date(filters.startsAfter) };
  }

  if (filters.endsBefore) {
    query.endAt = { ...(query.endAt ?? {}), $lte: new Date(filters.endsBefore) };
  }

  if (filters.date) {
    const startOfDay = new Date(`${filters.date}T00:00:00.000Z`);
    const endOfDay = new Date(`${filters.date}T23:59:59.999Z`);
    query.startAt = { ...(query.startAt ?? {}), $lte: endOfDay };
    query.endAt = { ...(query.endAt ?? {}), $gte: startOfDay };
  }

  return query;
};
```

Fråga till dig: varför bygger vi en `query` i stället för att först hämta alla tävlingar och sedan filtrera i JavaScript?

Svar: databasen är bättre på att filtrera stora mängder data. Vid mycket trafik blir det billigare och snabbare.

Skriv sedan controller-funktionerna:

```ts
export const listCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.competitionFilters) {
      throw new HttpError(500, "FILTERS_NOT_PARSED", "Tävlingsfilter saknas");
    }

    const competitions = await CompetitionModel.find(
      buildCompetitionQuery(req.competitionFilters),
    ).sort({ startAt: 1 });

    return res.json(competitions.map(toCompetitionResponse));
  } catch (error) {
    return next(error);
  }
};

export const getCompetitionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competition = await getCompetitionOrThrow(req.params.id);
    const runnersCount = await RunnerModel.countDocuments({
      competitionId: competition._id,
    });

    return res.json({
      ...toCompetitionResponse(competition),
      runnersCount,
    });
  } catch (error) {
    return next(error);
  }
};

export const createCompetitionForOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const validatedBody = req.validatedBody as ValidatedCompetitionBody;

    const competition = await CompetitionModel.create({
      organizerId: req.organizer.id,
      name: validatedBody.name,
      type: validatedBody.type,
      place: validatedBody.place,
      startAt: toDate(validatedBody.startAt),
      endAt: toDate(validatedBody.endAt),
    });

    return res.status(201).json(toCompetitionResponse(competition));
  } catch (error) {
    return next(error);
  }
};

export const updateCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const competition = await getCompetitionOrThrow(req.params.id);
    requireCompetitionOwner(competition.organizerId.toString(), req.organizer.id);

    const validatedBody = req.validatedBody as ValidatedCompetitionBody;

    competition.name = validatedBody.name;
    competition.type = validatedBody.type;
    competition.place = validatedBody.place;
    competition.startAt = toDate(validatedBody.startAt);
    competition.endAt = toDate(validatedBody.endAt);

    await competition.save();

    return res.json(toCompetitionResponse(competition));
  } catch (error) {
    return next(error);
  }
};

export const deleteCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const competition = await getCompetitionOrThrow(req.params.id);
    requireCompetitionOwner(competition.organizerId.toString(), req.organizer.id);

    await RunnerModel.deleteMany({ competitionId: competition._id });
    await competition.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
```

Varför? Nu sparas, hämtas, uppdateras och tas tävlingar bort i MongoDB. Annars hade API:t sett rätt ut men tappat data vid omstart.

## Vecka 5: relationer, filter och tester

### Uppdatera query-schema

Fil: `backyard/backend/src/schemas/competitionFiltersSchema.ts`

När `organizerId` blir MongoDB-id ska det vara en sträng och valideras som ObjectId.

```ts
import { Types } from "mongoose";
import HttpError from "../errors/httpError";

export type CompetitionFilters = {
  organizerId: string | null;
  type: string | null;
  place: string | null;
  date: string | null;
  startsAfter: string | null;
  endsBefore: string | null;
};

const toSingleString = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : null;
  }

  return String(value);
};

const parseOrganizerId = (value: unknown): string | null => {
  const organizerId = toSingleString(value);

  if (!organizerId) {
    return null;
  }

  if (!Types.ObjectId.isValid(organizerId)) {
    throw new HttpError(400, "BAD_REQUEST", "organizerId måste vara ett giltigt MongoDB-id");
  }

  return organizerId;
};
```

Behåll resten av filens datum- och textvalidering.

### Fråga

Varför ska filtrering med MongoDB ligga i controller eller service, inte i route-filen?

Svar: route-filen ska bara koppla ihop URL och funktioner. Databaslogik hör hemma i controller/service.

### Testa mot MongoDB

Fil: `backyard/backend/src/__tests__/app.test.ts`

När controllers använder Mongoose behöver testerna koppla upp sig mot en testdatabas. Ett bra sätt är `mongodb-memory-server`.

Lägg till ungefär detta högst upp i testfilen:

```ts
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { OrganizerModel } from "../models/organizer.model";
import { CompetitionModel } from "../models/competition.model";
import { RunnerModel } from "../models/runner.model";
import { RunnerAccountModel } from "../models/runnerAccount.model";
import { hashPassword } from "../utils/security";

let mongoServer: MongoMemoryServer;
```

Uppdatera `before` och `after`:

```ts
before(async () => {
  process.env.AUTH_SECRET = "test-secret";

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const organizer = await OrganizerModel.create({
    name: "Backyard Ultra Sverige",
    email: "arrangor@example.com",
    passwordHash: await hashPassword("password123"),
  });

  await CompetitionModel.create({
    organizerId: organizer._id,
    name: "Skogsgläntans Backyard Ultra",
    type: "Backyard Ultra",
    place: "Umeå",
    startAt: new Date("2026-06-13T10:00:00.000Z"),
    endAt: new Date("2026-06-14T18:00:00.000Z"),
  });

  server = await new Promise((resolve, reject) => {
    const testServer = app.listen(0, "127.0.0.1");
    testServer.once("listening", () => resolve(testServer));
    testServer.once("error", reject);
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Testservern startade utan port");
  }

  baseUrl = `http://localhost:${address.port}`;
});

after(async () => {
  server.close();
  await OrganizerModel.deleteMany({});
  await CompetitionModel.deleteMany({});
  await RunnerModel.deleteMany({});
  await RunnerAccountModel.deleteMany({});
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

Varför? Tester ska kunna köras om och om igen utan att förstöra din riktiga databas.

Alternativ: du kan använda en separat MongoDB-testdatabas via `.env.test`, men `mongodb-memory-server` är smidigare för automatiska tester.

## Vecka 6: validering och felhantering

### Fråga

Varför ska valideringen ligga före controllern?

Ledtråd: vad händer om controllern antar att `startAt` finns, men klienten inte skickar det?

### Status i ditt projekt

Det här är redan bra:

- `middleware/validate.ts` kör parsern före controller.
- `schemas/competitionSchema.ts` validerar request body.
- `errors/httpError.ts` ger egna HTTP-fel.
- `middleware/errorHandler.ts` ger samma felformat överallt.

### Kontrollkod

Fil: `backyard/backend/src/middleware/validate.ts`

Den här idén ska vara kvar:

```ts
type BodyParser = (body: unknown) => unknown;

const validateBody = (parser: BodyParser) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validatedBody = parser(req.body);
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const validateCompetition = validateBody(parseCompetition);
```

Varför? Controllern slipper kontrollera varje fält själv. Den kan lita på `req.validatedBody`.

Alternativ: Zod eller Joi är också bra lösningar. Manuell validering är däremot bra träning, eftersom du ser exakt vad som händer.

## Vecka 7: säkerhet, bcrypt och JWT

### Fråga

Vad är skillnaden mellan att hasha ett lösenord och att kryptera ett lösenord?

Svar: hashning är enkelriktad. Du ska inte kunna få tillbaka original-lösenordet.

### Uppdatera security.ts

Fil: `backyard/backend/src/utils/security.ts`

Ersätt egen token- och lösenordskod med `bcrypt` och `jsonwebtoken`:

```ts
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

import type { AuthRole, TokenPayload } from "../types/domain";

type TokenUser = {
  id: string;
  email: string;
};

const TOKEN_TTL = "2h";

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET saknas i miljövariablerna");
  }

  return secret;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  storedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, storedPassword);
};

export const createToken = (user: TokenUser, role: AuthRole): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role,
    },
    getAuthSecret(),
    { expiresIn: TOKEN_TTL },
  );
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const payload = jwt.verify(token, getAuthSecret());

    if (typeof payload === "string") {
      return null;
    }

    const jwtPayload = payload as JwtPayload & {
      sub?: string;
      email?: string;
      role?: AuthRole;
    };

    if (!jwtPayload.sub || !jwtPayload.email || !jwtPayload.role || !jwtPayload.exp) {
      return null;
    }

    return {
      sub: jwtPayload.sub,
      email: jwtPayload.email,
      role: jwtPayload.role,
      exp: jwtPayload.exp,
    };
  } catch {
    return null;
  }
};
```

Viktigt: eftersom `hashPassword` och `verifyPassword` nu är async måste du använda `await` i controllers.

### Uppdatera organizersController

Fil: `backyard/backend/src/controllers/organizersController.ts`

Byt från `organizers` array till `OrganizerModel`.

```ts
import type { NextFunction, Request, Response } from "express";

import {
  OrganizerModel,
  toPublicOrganizer,
} from "../models/organizer.model";
import type {
  LoginBody,
  OrganizerRegistrationBody,
} from "../schemas/organizerSchema";
import HttpError from "../errors/httpError";
import { createToken, hashPassword, verifyPassword } from "../utils/security";

export const registerOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.validatedBody as OrganizerRegistrationBody;
    const existingOrganizer = await OrganizerModel.findOne({ email });

    if (existingOrganizer) {
      throw new HttpError(409, "EMAIL_ALREADY_EXISTS", "En arrangör med den e-posten finns redan");
    }

    const organizer = await OrganizerModel.create({
      name,
      email,
      passwordHash: await hashPassword(password),
    });

    return res.status(201).json({
      organizer: toPublicOrganizer(organizer),
      token: createToken({ id: organizer.id, email: organizer.email }, "organizer"),
    });
  } catch (error) {
    return next(error);
  }
};

export const loginOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.validatedBody as LoginBody;
    const organizer = await OrganizerModel.findOne({ email });

    if (!organizer || !(await verifyPassword(password, organizer.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Fel email eller lösenord");
    }

    return res.json({
      organizer: toPublicOrganizer(organizer),
      token: createToken({ id: organizer.id, email: organizer.email }, "organizer"),
    });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.organizer) {
    return next(new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör"));
  }

  return res.json({ organizer: req.organizer });
};
```

### Uppdatera auth middleware

Fil: `backyard/backend/src/middleware/auth.ts`

Byt från arrays till MongoDB:

```ts
import type { NextFunction, Request, Response } from "express";

import { OrganizerModel, toPublicOrganizer } from "../models/organizer.model";
import { RunnerAccountModel, toPublicRunnerAccount } from "../models/runnerAccount.model";
import HttpError from "../errors/httpError";
import { verifyToken } from "../utils/security";

const getBearerToken = (req: Request) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.replace("Bearer ", "");
};

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(req);
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== "organizer") {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const organizer = await OrganizerModel.findById(payload.sub);

    if (!organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Arrangören finns inte längre");
    }

    req.organizer = toPublicOrganizer(organizer);
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireRunnerAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(req);
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== "runner") {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som löpare");
    }

    const runnerAccount = await RunnerAccountModel.findById(payload.sub);

    if (!runnerAccount) {
      throw new HttpError(401, "UNAUTHORIZED", "Löparkontot finns inte längre");
    }

    req.runnerAccount = toPublicRunnerAccount(runnerAccount);
    return next();
  } catch (error) {
    return next(error);
  }
};
```

Varför? Token säger vem användaren är, men databasen bekräftar att användaren fortfarande finns.

Alternativ: du kan använda sessions/cookies i stället för JWT. JWT är vanligt för API:er och matchar kursmålet bra.

## Kontrollera Express-typer

Fil: `backyard/backend/src/types/express.d.ts`

När `req.organizer` och `req.runnerAccount` blir publika objekt från MongoDB ska typen passa:

```ts
import type { PublicOrganizer, PublicRunnerAccount } from "./domain";
import type { CompetitionFilters } from "../schemas/competitionFiltersSchema";

declare global {
  namespace Express {
    interface Request {
      organizer?: PublicOrganizer;
      runnerAccount?: PublicRunnerAccount;
      validatedBody?: unknown;
      competitionFilters?: CompetitionFilters;
    }
  }
}

export {};
```

Varför? Middleware lägger in användaren på `req`. TypeScript behöver veta att de fälten finns.

## Checklista för att du ska vara klar

Markera bara när du både har kod och kan förklara varför.

- [ ] Jag kan förklara skillnaden mellan `app.ts` och `server.ts`.
- [ ] Alla API-routes ligger under `/api/v1`.
- [ ] Routes väljer middleware/controller, men innehåller inte databaskod.
- [ ] `id`, `organizerId`, `competitionId` och `runnerAccountId` är anpassade till MongoDB-id.
- [ ] `competition.model.ts` exporterar `CompetitionModel`.
- [ ] `organizer.model.ts` exporterar `OrganizerModel`.
- [ ] `runner.model.ts` exporterar `RunnerModel`.
- [ ] `runnerAccount.model.ts` exporterar `RunnerAccountModel`.
- [ ] `competitionsController.ts` använder MongoDB i stället för `competitions.push(...)`.
- [ ] `organizersController.ts` använder MongoDB i stället för `organizers.find(...)`.
- [ ] `auth.ts` hämtar användare från MongoDB efter att token verifierats.
- [ ] Lösenord hash:as med `bcrypt`.
- [ ] Token skapas och verifieras med `jsonwebtoken`.
- [ ] Tester kör mot en testdatabas.
- [ ] Fel går via `next(error)` och central `errorHandler`.

## Kör kontroller

När du har gjort en del, kör:

```bash
cd backyard/backend
npm run build
npm test
```

Om TypeScript stoppar dig är det bra. Då får du veta exakt vilken fil som fortfarande tror att ett id är `number`, eller vilken controller som fortfarande använder gammal array-logik.

## Bra ordning att göra arbetet i

1. Uppdatera `types/domain.ts`.
2. Skapa Mongoose models.
3. Uppdatera `security.ts`.
4. Uppdatera `organizersController.ts`.
5. Uppdatera `auth.ts`.
6. Uppdatera `competitionsController.ts`.
7. Uppdatera `runnersController.ts`.
8. Uppdatera testerna.
9. Kör `npm run build`.
10. Kör `npm test`.

Du gör rätt som vill ha fil och kod konkret. Det centrala att öva på nu är att följa en request hela vägen: route, middleware, validering, controller, model, databas och tillbaka till response. När du kan följa den kedjan har du förstått backend på riktigt.
