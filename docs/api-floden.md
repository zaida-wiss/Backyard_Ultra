# API-flöden: Backyard Ultra

Relaterade dokument:

- [Dokumentationsöversikt](./README.md)
- [GDPR, loggning och radering](./gdpr-loggning.md)
- [Status vecka 1-9](../backyard/vecka-01-09-status-och-vagledning.md)

## Auth-flöde

```mermaid
sequenceDiagram
  participant User as Användare
  participant Frontend
  participant API as Express API
  participant DB as MongoDB

  User->>Frontend: Fyller i login-formulär
  Frontend->>Frontend: Validerar med Zod
  Frontend->>API: POST /api/v1/organizers/login eller /runners/login
  API->>DB: Hämtar konto via email
  API->>API: Jämför lösenord med bcrypt
  API-->>Frontend: JWT med roll
```

## Anmälningsflöde

```mermaid
sequenceDiagram
  participant Runner as Löpare
  participant Frontend
  participant API as Express API
  participant DB as MongoDB

  Runner->>Frontend: Klickar på Anmäl mig
  Frontend->>API: POST /api/v1/competitions/:competitionId/runners/me
  API->>API: Verifierar JWT och requireRole("runner")
  API->>DB: Kontrollerar befintlig aktiv anmälan
  API->>DB: Skapar anmälan
  DB-->>API: Sparad anmälan
  API-->>Frontend: 201 Created
```

## Roll- Och Behörighetsflöde

```mermaid
sequenceDiagram
  participant Client as Klient
  participant API as Express API
  participant Auth as Auth middleware
  participant Controller

  Client->>API: Request med Authorization: Bearer token
  API->>Auth: requireAuth eller requireRunnerAuth
  Auth->>Auth: Verifierar JWT
  Auth->>Auth: Sätter req.authUser
  API->>Auth: requireRole(...)
  Auth-->>Controller: Släpper vidare om rollen matchar
```

## Soft Delete-Flöde

```mermaid
sequenceDiagram
  participant Organizer as Arrangör
  participant API as Express API
  participant DB as MongoDB

  Organizer->>API: DELETE /api/v1/runners/:id
  API->>API: Verifierar JWT och requireRole("organizer", "admin")
  API->>DB: Sätter deletedAt på anmälan
  DB-->>API: Uppdaterad anmälan
  API-->>Organizer: 204 No Content
```

## Viktiga endpoints

```md
POST /api/v1/organizers/register
POST /api/v1/organizers/login
GET  /api/v1/organizers/me

GET    /api/v1/competitions?page=1&limit=20
POST   /api/v1/competitions
GET    /api/v1/competitions/:id
PUT    /api/v1/competitions/:id
DELETE /api/v1/competitions/:id

GET  /api/v1/competitions/:competitionId/runners
POST /api/v1/competitions/:competitionId/runners
POST /api/v1/competitions/:competitionId/runners/me

POST /api/v1/runners/register
POST /api/v1/runners/login
GET  /api/v1/runners/me
GET  /api/v1/runners/me/registrations
```

## GDPR och loggning

- Frontend och backend validerar bara de fält som behövs.
- Request-loggen använder Pino och pino-http.
- Request-loggen sparar HTTP-data som metod, url, status och responstid.
- Lösenord, tokens och request body loggas inte.
- Anmälningar tas bort med soft delete (`deletedAt`) så historik kan hanteras utan att aktiva listor visar raderad data.

## Roller

Roller beskriver behörighet:

- `admin`: kan administrera bredare flöden.
- `organizer`: kan skapa och hantera tävlingar.
- `runner`: kan se tävlingar och anmäla sig.

Lag/solo bör inte bli auth-roller. Det är bättre som anmälningsdata, till exempel `teamId` eller `registrationType`, eftersom det beskriver hur någon deltar, inte vad personen får göra i systemet.
