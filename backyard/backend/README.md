# Backyard Ultra Backend

Express-backend for arrangorer, tavlingar och lopare.

## Starta

```bash
npm install
npm run dev
```

Bygg TypeScript till JavaScript:

```bash
npm run build
```

Servern startar pa:

```text
http://localhost:3000
```

## Demo-inloggning

Det finns en seedad arrangor for lokal testning:

```json
{
  "email": "arrangor@example.com",
  "password": "password123"
}
```

## Flode

1. Registrera eller logga in som arrangor.
2. Skapa en tavling med namn, typ, plats och datum.
3. Registrera lopare pa tavlingen.

## Endpoints

### Arrangorer

```http
POST /api/v1/organizers/register
```

```json
{
  "name": "Trail AB",
  "email": "kontakt@trail.se",
  "password": "password123"
}
```

```http
POST /api/v1/organizers/login
```

```json
{
  "email": "arrangor@example.com",
  "password": "password123"
}
```

```http
GET /api/v1/organizers/me
Authorization: Bearer <token>
```

### Tavlingar

```http
GET /api/v1/competitions
GET /api/v1/competitions/:id
POST /api/v1/competitions
PUT /api/v1/competitions/:id
DELETE /api/v1/competitions/:id
```

Filtrera tavlingar:

```http
GET /api/v1/competitions?date=2026-06-13&type=backyard&organizerId=1&place=ume
```

Tillgangliga filter:

```text
date        exakt datum, format YYYY-MM-DD
startsAfter starttid fran och med
endsBefore  sluttid till och med
type        typ av tavling, till exempel Backyard Ultra
organizerId arrangorens id
place       plats eller del av platsnamn
```

Skapa eller uppdatera tavling:

```json
{
  "name": "Skogsglantans Backyard Ultra",
  "type": "Backyard Ultra",
  "place": "Umea",
  "startAt": "2026-06-13T10:00",
  "endAt": "2026-06-14T18:00"
}
```

`POST`, `PUT` och `DELETE` kraver:

```http
Authorization: Bearer <token>
```

### Lopare

```http
POST /api/v1/runners/register
POST /api/v1/runners/login
GET /api/v1/runners/me
GET /api/v1/runners/me/registrations
GET /api/v1/runners
GET /api/v1/runners/:id
GET /api/v1/competitions/:competitionId/runners
POST /api/v1/competitions/:competitionId/runners
POST /api/v1/competitions/:competitionId/runners/me
PUT /api/v1/runners/:id
DELETE /api/v1/runners/:id
```

Skapa loparkonto:

```json
{
  "firstName": "Sara",
  "lastName": "Lind",
  "email": "sara@example.com",
  "password": "password123",
  "club": "Skogsloparna"
}
```

Logga in som lopare:

```json
{
  "email": "sara@example.com",
  "password": "password123"
}
```

Inloggad lopare anmaler sig sjalv till en tavling:

```http
POST /api/v1/competitions/1/runners/me
Authorization: Bearer <runner-token>
```

Registrera eller uppdatera lopare:

```json
{
  "firstName": "Zaid",
  "lastName": "Awiss",
  "email": "zaid@example.com",
  "club": "Backyard Runners"
}
```

## Felstruktur

Alla explicita fel returneras i samma format:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "startAt och endAt maste skrivas som YYYY-MM-DDTHH:mm",
    "status": 400
  }
}
```

## Varfor den har strukturen?

- `routes/` bestammer URL och middleware.
- `controllers/` hanterar request och response.
- `models/` skapar objektens form.
- `middleware/` innehaller auth, validering och felhantering.
- `data/store.js` ar tillfallig in-memory-lagring och kan senare bytas mot databas.
