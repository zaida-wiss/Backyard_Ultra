# Status Och Vägledning: Kursvecka 1-9

Kort svar: **projektet har kod eller dokumentation för de centrala momenten från vecka 1-9**.

## Dokument Som Hör Till

- [Dokumentationsöversikt](../docs/README.md)
- [API-flöden](../docs/api-floden.md)
- [GDPR, loggning och radering](../docs/gdpr-loggning.md)
- [PDF-inlärningsmål vecka 1-9](../docs/pdf-inlarningsmal/README.md)

## Samlad Status

| Vecka | Område | Status | Viktiga filer |
| --- | --- | --- | --- |
| 1 | Node.js, HTTP, Express | Klart | `backend/src/app.ts`, `backend/src/server.ts` |
| 2 | REST, routes, middleware | Klart | `backend/src/routes/`, `backend/src/controllers/`, `backend/src/middleware/` |
| 3 | TypeScript + ESM | Klart | `backend/tsconfig.json`, `backend/package.json` |
| 4 | MongoDB + Mongoose | Klart | `backend/src/config/database.ts`, `backend/src/models/` |
| 5 | Relationer, filter, testning | Klart nog | `competitionQuery.ts`, `runner.model.ts`, `app.test.ts` |
| 6 | Validering + felhantering | Klart | `schemas/`, `middleware/validate.ts`, `errorHandler.ts` |
| 7 | Säkerhet, bcrypt, JWT | Klart | `utils/jwt.ts`, `middleware/auth.ts` |
| 8 | RBAC + config | Klart | `middleware/auth.ts`, `config/env.ts`, `organizer.model.ts` |
| 9 | GDPR, loggning, dokumentation | Klart nog | `requestLogger.ts`, `utils/logger.ts`, `docs/api-floden.md`, `docs/gdpr-loggning.md` |

## Vad Som Finns Nu

- Backend bygger med TypeScript och ESM.
- Routes är tunna och pekar vidare till middleware + controllers.
- Body och params valideras innan controllers.
- Frontend-login valideras med Zod.
- Backend `.env` valideras med Zod i `config/env.ts`.
- `AUTH_SECRET`, `MONGO_URI`, `PORT` och `CORS_ORIGIN` läses via typad config.
- JWT innehåller roll och `requireRole(...)` används i skyddade routes.
- Organizer har roll i databasen (`organizer` eller `admin`).
- Löparanmälningar har unika index som skyddar mot dubbelanmälan.
- Löparanmälningar tas bort med soft delete (`deletedAt`) och listas bara när de är aktiva.
- Request-loggning är strukturerad med Pino och pino-http.
- Loggningen loggar inte request body, lösenord eller tokens.
- API-flöden finns dokumenterade med Mermaid i `docs/api-floden.md`.
- GDPR/loggning/radering finns dokumenterat i `docs/gdpr-loggning.md`.

## Checklista

- [x] Vecka 1: Express-server och grundroutes finns.
- [x] Vecka 2: REST-struktur, routes, controllers och error handler finns.
- [x] Vecka 3: TypeScript och ESM används i backend.
- [x] Vecka 4: MongoDB och Mongoose används.
- [x] Vecka 5: Pagination finns i `GET /api/v1/competitions`.
- [x] Vecka 5: Unikt index skyddar mot dubbelanmälan.
- [x] Vecka 6: Params valideras via schema/middleware.
- [x] Vecka 7: bcrypt och JWT används.
- [x] Vecka 7: Skyddade routes kräver Bearer-token.
- [x] Vecka 8: roller och `requireRole(...)` finns.
- [x] Vecka 8: samlad config-fil med Zod-validerad `.env` finns.
- [x] Vecka 9: strukturerad logger finns med Pino och pino-http.
- [x] Vecka 9: känslig data undviks/redacteras i loggar.
- [x] Vecka 9: soft delete finns.
- [x] Vecka 9: API-flöden och GDPR/loggning/radering är dokumenterade.
