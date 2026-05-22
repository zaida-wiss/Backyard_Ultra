# Workshop: Backendstruktur och kursmål vecka 1-7

Den här workshoppen är till för att du själv ska kunna kontrollera om Backyard Ultra-backenden har den struktur och funktionalitet som studiematerialet går igenom vecka 1-7.

Arbeta så här:

1. Läs frågan först.
2. Försök svara utan att titta på facit.
3. Öppna filen som nämns.
4. Jämför med kodexemplet.
5. Markera checklistan.

Du har redan gjort mycket rätt: projektet har Express, routes, controllers, TypeScript, validering, felhantering, auth, filtrering och tester. Det viktigaste nästa steget är att kunna förklara varför varje del finns.

## Backendstruktur enligt studiematerialet

Studiematerialet tränar dig på att dela upp ett Express-projekt efter ansvar. Det betyder att varje mapp ska ha en tydlig uppgift.

En bra målstruktur ser ut så här:

```text
src/
  app.ts
  server.ts
  config/
    database.ts
  routes/
    competitions-route.ts
    organizers-route.ts
    runners-route.ts
  controllers/
    competitionsController.ts
    organizersController.ts
    runnersController.ts
  models/
    competition.model.ts
    organizer.model.ts
    runner.model.ts
    runnerAccount.model.ts
  schemas/
    competitionSchema.ts
    competitionFiltersSchema.ts
    organizerSchema.ts
    runnerSchema.ts
  middleware/
    auth.ts
    competitionFilters.ts
    validate.ts
    errorHandler.ts
  services/
    competitionFilters.ts
  data/
    store.ts
  utils/
    security.ts
  errors/
    httpError.ts
  types/
    domain.ts
    express.d.ts
  __tests__/
    app.test.ts
```

Det viktiga är inte att alla projekt måste se exakt likadana ut. Det viktiga är att du kan svara på frågan: vilken fil ansvarar för vad?

## Vad varje del gör

| Del | Ansvar | Exempel i ditt projekt |
| --- | --- | --- |
| `app.ts` | Skapar Express-appen och monterar middleware/routes | `src/app.ts` |
| `server.ts` | Startar servern och kopplar till MongoDB | `src/server.ts` |
| `routes/` | Bestämmer URL och HTTP-metod | `src/routes/competitions-route.ts` |
| `controllers/` | Tar emot request och skickar response | `src/controllers/competitionsController.ts` |
| `models/` | Beskriver data eller skapar dataobjekt | `src/models/competition.model.ts` |
| `schemas/` | Valideringsschema för request body och query | `src/schemas/competitionFiltersSchema.ts` |
| `middleware/` | Körs före/efter controllers | `src/middleware/competitionFilters.ts` |
| `errorHandler` | Samlar API-fel på ett ställe | `src/middleware/errorHandler.ts` |
| `services/` | Logik som inte behöver känna till Express | `src/services/competitionFilters.ts` |
| `data/` | Tillfällig in-memory data före full MongoDB-migrering | `src/data/store.ts` |
| `config/` | Läser miljö och anslutningar | `src/config/database.ts` |
| `types/` | TypeScript-typer | `src/types/domain.ts` |
| `utils/` | Små hjälpfunktioner | `src/utils/security.ts` |
| `errors/` | Egna felklasser | `src/errors/httpError.ts` |
| `__tests__/` | Automatiska tester | `src/__tests__/app.test.ts` |

### Fråga till dig

Om en request kommer in här:

```text
POST /api/v1/competitions
```

Vilken ordning går den genom?

Försök svara själv först.

### Rimlig ordning

```text
app.ts
  -> routes/competitions-route.ts
  -> middleware/auth.ts
  -> middleware/validate.ts
  -> schemas/competitionSchema.ts
  -> controllers/competitionsController.ts
  -> models eller services
  -> response till klienten

Om något går fel:
  -> middleware/errorHandler.ts
```

Det här är en av de viktigaste sakerna att kunna förklara. När du kan följa en request genom projektet har du förstått Express-strukturen på riktigt.

För `GET /api/v1/competitions` ser flödet ut så här:

```text
routes/competitions-route.ts
  -> middleware/competitionFilters.ts
  -> schemas/competitionFiltersSchema.ts
  -> controllers/competitionsController.ts
  -> services/competitionFilters.ts
  -> response till klienten
```

Det är en bra uppdelning:

- middleware känner till `req`, `res`, `next`
- schema validerar/parsar input
- controller skickar svar
- service gör återanvändbar logik utan Express

## Nuvarande status i ditt projekt

| Område | Status | Kommentar |
| --- | --- | --- |
| Routes | Finns | Bra uppdelat i `organizers`, `competitions`, `runners` |
| Controllers | Finns | Följer mönstret `export const namn = async` |
| Middleware | Finns | Auth, validering och error handler finns |
| Error handler | Finns | Centraliserad felhantering finns |
| Errors | Finns | `HttpError` ligger i `src/errors/httpError.ts` |
| Services | Finns | Filtrering är flyttad till service |
| Schemas | Finns | Request-validering ligger i `src/schemas` |
| Types | Finns | Domäntyper och Express-augmentering finns |
| Config | Finns | MongoDB-anslutning finns |
| Models | Delvis | Just nu mest factory-funktioner, inte riktiga Mongoose models |
| Database persistence | Delvis | MongoDB kopplas upp, men controllers använder fortfarande `data/store.ts` |

Det du gör rätt är att du redan har separerat mycket av koden. Det du behöver öva mer på är skillnaden mellan request-schemas i `schemas/` och Mongoose-schemas som används för faktisk datalagring i MongoDB.

## Snabb översikt

| Vecka | Område | Status i projektet | Viktigaste kontrollen |
| --- | --- | --- | --- |
| 1 | Node.js och Express | Finns | Kan servern starta och svara? |
| 2 | REST, routes och middleware | Finns | Är API:t uppdelat i resurser? |
| 3 | TypeScript | Finns | Är request/response och domäner typade? |
| 4 | MongoDB och Mongoose | Delvis | Servern kopplar upp sig, men controllers använder fortfarande in-memory store |
| 5 | Relationer, filter och testning | Finns | Kan tävlingar filtreras och testas? |
| 6 | Validering och felhantering | Finns | Går fel via `next(error)` och central error handler? |
| 7 | Säkerhet och auth | Delvis | Auth finns, men kursmålet nämner bcrypt/JWT-bibliotek uttryckligen |

## Vecka 1: Node.js, HTTP och Express

### Mål

Du ska kunna:

- starta en Node-server
- förstå request och response
- använda Express
- skapa enkla endpoints
- förstå middleware-kedjan

### Titta i projektet

Öppna:

- `backyard/backend/src/app.ts`
- `backyard/backend/src/server.ts`
- `backyard/backend/package.json`

### Fråga till dig

Varför exporterar vi `app` från `app.ts` och startar servern i `server.ts`?

Försök svara innan du läser vidare.

### Förklaring

`app.ts` innehåller själva Express-appen. `server.ts` ansvarar för att starta lyssningen på en port. Det gör projektet lättare att testa, eftersom tester kan importera `app` utan att behöva starta hela servern på en fast port.

### Kodexempel att skriva av

```ts
import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

export default app;
```

### Varför är detta viktigt?

Utan `express.json()` kan backend inte läsa JSON från request body. Då blir `req.body` tom eller `undefined`, och routes som `POST /login` fungerar inte.

### Alternativ

Du kan lägga allt i en enda `server.ts`, men uppdelningen `app.ts` + `server.ts` är bättre när du vill testa API:t.

### Checklista

- [ ] Jag kan peka ut var Express-appen skapas.
- [ ] Jag kan förklara vad `app.use(express.json())` gör.
- [ ] Jag kan förklara varför `app.ts` exporteras.
- [ ] Jag kan starta backend med `npm run dev`.

## Vecka 2: REST API, routes och middleware

### Mål

Du ska kunna:

- strukturera routes
- använda REST-resurser
- förstå HTTP-metoder
- använda middleware i rätt ordning
- bygga versionerade API-routes

### Titta i projektet

Öppna:

- `backyard/backend/src/app.ts`
- `backyard/backend/src/routes/competitions-route.ts`
- `backyard/backend/src/routes/organizers-route.ts`
- `backyard/backend/src/routes/runners-route.ts`

### Fråga till dig

Vilken resurs representerar den här endpointen?

```text
POST /api/v1/competitions/:competitionId/runners/me
```

Ledtråd: den handlar både om en tävling och den inloggade löparen.

### Förklaring

Endpointen skapar en anmälan för den inloggade löparen till en specifik tävling. Det är rimligt att den ligger under `competitions`, eftersom anmälan sker till just en tävling.

### Kodexempel att skriva av

```ts
import { Router } from 'express';
import { requireRunnerAuth } from '../middleware/auth';
import { registerCurrentRunnerForCompetition } from '../controllers/runnersController';

const router = Router();

router.post(
  '/:competitionId/runners/me',
  requireRunnerAuth,
  registerCurrentRunnerForCompetition,
);

export default router;
```

### Varför är detta viktigt?

Routes ska läsa som API:ets språk. Om allt hamnar i en enda fil eller får otydliga namn blir det svårt att veta var ny funktionalitet ska läggas.

### Alternativ

Du hade också kunnat skapa en separat resurs:

```text
POST /api/v1/registrations
```

Det är också en bra lösning. Den blir extra tydlig om anmälningar får mycket egen logik senare.

### Workshop-övning

Skriv med egna ord vad varje route gör:

```text
GET    /api/v1/competitions
POST   /api/v1/competitions
GET    /api/v1/competitions/:id
PUT    /api/v1/competitions/:id
DELETE /api/v1/competitions/:id
```

### Checklista

- [ ] API:t använder `/api/v1`.
- [ ] Routes är uppdelade efter resurs.
- [ ] `GET`, `POST`, `PUT` och `DELETE` används rimligt.
- [ ] Middleware ligger före controller i routes.
- [ ] Jag kan förklara skillnaden mellan route och controller.

## Vecka 3: TypeScript i Express

### Mål

Du ska kunna:

- använda TypeScript i Node
- skapa egna typer
- typa Express `Request`, `Response` och `NextFunction`
- förstå varför `unknown` är säkrare än `any`
- bygga kod med `tsc`

### Titta i projektet

Öppna:

- `backyard/backend/src/types/domain.ts`
- `backyard/backend/src/types/express.d.ts`
- `backyard/backend/src/controllers/competitionsController.ts`
- `backyard/backend/tsconfig.json`

### Fråga till dig

Varför är detta bättre än att låta allt vara `any`?

```ts
type Competition = {
  id: number;
  organizerId: number;
  name: string;
  type: string;
  place: string;
  startAt: string;
  endAt: string;
};
```

### Förklaring

TypeScript hjälper dig upptäcka fel innan servern körs. Om du råkar skriva `competition.plase` i stället för `competition.place` får du ett fel direkt.

### JavaScript jämfört med TypeScript

```js
const createCompetition = (input) => {
  return {
    name: input.name,
    place: input.place,
  };
};
```

```ts
type CreateCompetitionInput = {
  name: string;
  place: string;
};

export const createCompetition = (input: CreateCompetitionInput) => {
  return {
    name: input.name,
    place: input.place,
  };
};
```

### Kodexempel att skriva av

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

### Varför är detta viktigt?

När controllers är typade blir det tydligare vad Express skickar in och vad funktionen ska göra vid fel. Det hjälper också när projektet växer.

### Alternativ

Du kan typa request body ännu hårdare med generics i Express, men i ett kursprojekt räcker det ofta att validera body först och lägga resultatet i `req.validatedBody`.

### Checklista

- [ ] Projektet har `tsconfig.json`.
- [ ] Backend byggs med `npm run build`.
- [ ] Domäntyper finns i `types/domain.ts`.
- [ ] Express request är utökad i `types/express.d.ts`.
- [ ] Controllers använder `export const namn = async`.

## Vecka 4: MongoDB och Mongoose

### Mål

Du ska kunna:

- koppla backend till MongoDB
- förstå collections och documents
- skapa Mongoose schemas och models
- använda miljövariabel för `MONGO_URI`
- förstå skillnaden mellan in-memory data och databasdata

### Titta i projektet

Öppna:

- `backyard/backend/src/config/database.ts`
- `backyard/backend/src/data/store.ts`
- `backyard/backend/src/models/competition.model.ts`

### Viktig status

Projektet har MongoDB-uppkoppling, men flera controllers använder fortfarande arrays från `data/store.ts`.

Det betyder:

- servern kan koppla till MongoDB
- men tävlingar, arrangörer och löpare sparas inte fullt ut i MongoDB ännu
- data försvinner när servern startas om, om den bara ligger i arrays

Det här är en jättebra sak att upptäcka själv. Det visar att du inte bara tittar efter om en fil finns, utan om funktionen faktiskt används.

### Fråga till dig

Om `createCompetitionForOrganizer` gör `competitions.push(competition)`, var sparas tävlingen då?

Svar: i minnet, inte i MongoDB.

### Kodexempel: Mongoose schema

```ts
import { Schema, model } from 'mongoose';

const competitionSchema = new Schema(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    place: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const CompetitionModel = model('Competition', competitionSchema);
```

### Kodexempel: controller med databas

```ts
export const createCompetitionForOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad');
    }

    const competition = await CompetitionModel.create({
      ...req.validatedBody,
      organizerId: req.organizer.id,
    });

    return res.status(201).json(competition);
  } catch (error) {
    return next(error);
  }
};
```

### Varför är detta viktigt?

Databasen gör att data finns kvar efter omstart. In-memory arrays är bra för att lära sig routes snabbt, men räcker inte som riktig backend.

### Alternativ

Du kan börja med in-memory store när du lär dig Express. Det är okej pedagogiskt. Men för kursmålet om databaser behöver controllers faktiskt läsa och skriva via Mongoose.

### Checklista

- [ ] `MONGO_URI` läses från `.env`.
- [ ] Servern kopplar upp sig till MongoDB vid start.
- [ ] Det finns Mongoose schemas.
- [ ] Controllers använder Mongoose models, inte bara arrays.
- [ ] Jag kan förklara varför in-memory data försvinner vid omstart.

## Vecka 5: Relationer, filtrering och testning

### Mål

Du ska kunna:

- modellera relationer mellan resurser
- filtrera med query params
- förstå `params`, `query` och `body`
- skriva API-tester
- testa både lyckade och felaktiga flöden

### Titta i projektet

Öppna:

- `backyard/backend/src/services/competitionFilters.ts`
- `backyard/backend/src/middleware/competitionFilters.ts`
- `backyard/backend/src/schemas/competitionFiltersSchema.ts`
- `backyard/backend/src/__tests__/app.test.ts`
- `backyard/backend/src/controllers/runnersController.ts`

### Fråga till dig

Vilken typ av data kommer från varje plats?

```text
req.params
req.query
req.body
```

Försök svara innan du läser:

- `params`: id i URL, till exempel `:competitionId`
- `query`: filter efter `?type=backyard`
- `body`: JSON-data från klienten

### Kodexempel: middleware-handler för query

```ts
export const parseCompetitionFiltersHandler = async (req, res, next) => {
  try {
    req.competitionFilters = parseCompetitionFilters(req.query);
    return next();
  } catch (error) {
    return next(error);
  }
};
```

### Kodexempel: service för filtrering

```ts
export const filterCompetitions = (competitions, filters) => {
  return competitions.filter((competition) => {
    if (filters.type && !competition.type.toLowerCase().includes(filters.type)) {
      return false;
    }

    return true;
  });
};
```

Fråga till dig: varför ska `filterCompetitions` inte använda `req.query` direkt?

Svar: för att en service ska kunna återanvändas även utanför Express, till exempel i tester eller senare i annan backendlogik.

### Kodexempel: test

```ts
it('can filter competitions by place', async () => {
  const response = await request('/api/v1/competitions?place=ume');

  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body[0].place, 'Umeå');
});
```

### Varför är detta viktigt?

Filtrering gör API:t användbart för frontend. Tester gör att du vågar ändra kod utan att råka förstöra gamla flöden.

### Alternativ

Du kan testa med Postman eller Thunder Client manuellt. Det är bra för att förstå API:t, men automatiska tester är bättre när du vill upptäcka fel snabbt.

### Workshop-övning

Lägg till ett test för en filtrering som ska ge tom lista:

```text
GET /api/v1/competitions?place=malmo
```

Förväntat:

```ts
assert.equal(body.length, 0);
```

### Checklista

- [ ] Tävlingar har relation till arrangör.
- [ ] Löpare/anmälda har relation till tävling.
- [ ] API:t kan filtrera på datum.
- [ ] API:t kan filtrera på typ.
- [ ] API:t kan filtrera på arrangör.
- [ ] API:t kan filtrera på plats.
- [ ] Det finns tester för viktiga flöden.

## Vecka 6: Validering och felhantering

### Mål

Du ska kunna:

- validera `body`, `params` och `query`
- förstå "Don't trust the client"
- använda valideringsmiddleware
- skilja på validering i appen och i databasen
- skicka fel till central error handler
- returnera konsekvent felformat

### Titta i projektet

Öppna:

- `backyard/backend/src/middleware/validate.ts`
- `backyard/backend/src/schemas/competitionSchema.ts`
- `backyard/backend/src/schemas/organizerSchema.ts`
- `backyard/backend/src/schemas/runnerSchema.ts`
- `backyard/backend/src/middleware/errorHandler.ts`
- `backyard/backend/src/errors/httpError.ts`

### Fråga till dig

Varför ska valideringen ligga före controllern?

Ledtråd: vad händer om controllern antar att `startAt` finns, men klienten inte skickar det?

### Förklaring

Validering före controller gör att controllern kan fokusera på affärslogik. Om data saknas eller är fel stoppas requesten tidigt med ett tydligt `400 Bad Request`.

### Kodexempel att skriva av

```ts
export const validateCompetition = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as Record<string, unknown>;

    if (typeof body.name !== 'string' || body.name.trim() === '') {
      throw new HttpError(400, 'BAD_REQUEST', 'tävlingsnamn krävs');
    }

    req.validatedBody = {
      name: body.name.trim(),
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
```

### Central felhantering

```ts
export const errorHandler = async (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        status: error.status,
      },
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Något gick fel',
      status: 500,
    },
  });
};
```

### Varför är detta viktigt?

Utan central felhantering får du lätt olika felformat i olika routes. Det gör frontend svårare att bygga och felsökning rörigare.

### Alternativ

Du kan använda Zod för schemas. Det är ofta en bättre lösning när valideringen växer, men manuell validering är bra för att förstå grunden.

### Checklista

- [ ] `POST /competitions` validerar body.
- [ ] Login validerar email och password.
- [ ] Fel skickas med `next(error)`.
- [ ] Det finns en `HttpError`.
- [ ] Alla API-fel har samma struktur.
- [ ] Jag kan förklara skillnaden mellan 400, 401, 403, 404 och 500.

## Vecka 7: Säkerhet, OWASP, lösenord och token

### Mål

Du ska kunna:

- förstå grundläggande backend-säkerhet
- beskriva Broken Access Control
- beskriva Cryptographic Failures
- beskriva Injection
- hash:a lösenord
- skapa login
- använda token
- skydda routes med auth middleware

### Titta i projektet

Öppna:

- `backyard/backend/src/utils/security.ts`
- `backyard/backend/src/middleware/auth.ts`
- `backyard/backend/src/controllers/organizersController.ts`
- `backyard/backend/src/controllers/runnersController.ts`

### Fråga till dig

Vad är skillnaden mellan 401 och 403?

Försök svara:

- 401: du är inte inloggad eller token är ogiltig
- 403: du är inloggad men har fel roll eller saknar behörighet

### Det projektet redan gör bra

- lösenord sparas inte i klartext
- token skapas vid login
- skyddade routes kräver `Authorization: Bearer <token>`
- arrangör och löpare har olika auth-middleware
- ägarskap kontrolleras innan tävling uppdateras eller tas bort

### Viktig kursnotering

Projektet använder Node `crypto` för hashning och en egen HMAC-token. Det är lärorikt, men PDF:ens vecka 7 nämner bcrypt och JWT.

För att matcha kursmålet tydligare kan du senare byta till:

- `bcrypt` för lösenord
- `jsonwebtoken` för JWT

### Kodexempel: lösenord med bcrypt

```ts
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
) => {
  return bcrypt.compare(password, passwordHash);
};
```

### Kodexempel: JWT

```ts
import jwt from 'jsonwebtoken';

export const createToken = (userId: string, role: 'organizer' | 'runner') => {
  return jwt.sign(
    { sub: userId, role },
    process.env.AUTH_SECRET as string,
    { expiresIn: '2h' },
  );
};
```

### Kodexempel: skyddad route

```ts
router.post(
  '/',
  requireAuth,
  validateCompetition,
  createCompetitionForOrganizer,
);
```

### OWASP kopplat till ditt projekt

Broken Access Control:

```ts
requireCompetitionOwner(competition, req.organizer.id);
```

Det hindrar en arrangör från att ändra någon annans tävling.

Cryptographic Failures:

```ts
const passwordHash = await hashPassword(password);
```

Det hindrar lösenord från att sparas i klartext.

Injection:

```ts
const id = Number(req.params.id);
```

Det är bättre än att skicka okontrollerad input direkt till databasen.

### Varför är detta viktigt?

Säkerhet kan inte bara ligga i frontend. Även om en knapp är gömd kan någon fortfarande skicka HTTP-request direkt till backend. Därför måste backend alltid kontrollera token, roll och ägarskap.

### Alternativ

Du kan använda sessions och cookies i stället för JWT. Du kan också använda Passport.js. För ett REST API med React frontend är JWT vanligt och pedagogiskt.

### Checklista

- [ ] Lösenord hash:as.
- [ ] Login jämför hashat lösenord.
- [ ] Login returnerar token.
- [ ] Skyddade routes kräver token.
- [ ] Backend skiljer på arrangör och löpare.
- [ ] Ägarskap kontrolleras innan ändring eller borttagning.
- [ ] Jag kan förklara 401 och 403.
- [ ] Jag kan nämna minst tre OWASP-risker.

## Slutövning: visa att vecka 1-7 finns

Gör detta som en mini-redovisning för dig själv.

### 1. Starta projektet

```bash
cd backyard/backend
npm run dev
```

Säg högt:

```text
Servern startar via server.ts, men Express-appen ligger i app.ts.
```

### 2. Kör tester

```bash
cd backyard/backend
npm test
```

Säg högt:

```text
Testerna startar appen, gör HTTP-anrop och kontrollerar API-svar.
```

### 3. Peka ut en route

```text
POST /api/v1/competitions
```

Säg högt:

```text
Den kräver arrangörstoken, validerar body och skapar en tävling.
```

### 4. Peka ut en säkerhetskontroll

```ts
requireCompetitionOwner(competition, req.organizer.id);
```

Säg högt:

```text
Den hindrar Broken Access Control eftersom arrangörer bara får ändra egna tävlingar.
```

### 5. Peka ut det största kvarvarande gapet

```text
Controllers behöver gå från in-memory arrays till Mongoose/MongoDB.
```

Det här är centralt. När du förstår detta har du verkligen förstått skillnaden mellan att "ha MongoDB installerat" och att "använda MongoDB som datalager".

## Samlad checklista vecka 1-7

- [ ] Vecka 1: jag kan förklara Express-appens startflöde.
- [ ] Vecka 2: jag kan förklara API-resurser och routes.
- [ ] Vecka 3: jag kan förklara projektets TypeScript-typer.
- [ ] Vecka 4: jag kan förklara MongoDB-gapet och vad som behöver ändras.
- [ ] Vecka 5: jag kan förklara relationer, filter och tester.
- [ ] Vecka 6: jag kan förklara validering och central felhantering.
- [ ] Vecka 7: jag kan förklara auth, token, roller och OWASP-risker.

## Rekommenderad nästa workshop

Nästa praktiska steg är att välja en resurs och flytta den från in-memory store till MongoDB.

Börja med `Competition`, eftersom den är central i appen:

1. skapa Mongoose-schema för `Competition`
2. skapa `CompetitionModel`
3. ändra `listCompetitions`
4. ändra `createCompetitionForOrganizer`
5. ändra `getCompetitionById`
6. ändra testerna så de använder testdata i databasen

Det är den övningen som tydligast binder ihop vecka 4, 5, 6 och 7.
