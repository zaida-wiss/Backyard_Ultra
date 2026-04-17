# Workshop – Kursvecka 1 (Node.js + Express)

Den här workshopfilen är byggd från studiematerialet för vecka 1 och anpassad till ditt projekt `Backyard_Ultra`.

## Mål med workshoppen
Efter passet ska du kunna:
- Förklara klient-server-modellen och stateless API-tänk.
- Starta en enkel Express-server i projektets `backend/`.
- Skapa grundläggande routes med `GET`, `POST`, `PUT`, `DELETE`.
- Använda `req.params`, `req.query` och `req.body`.
- Returnera korrekta statuskoder och JSON-svar.

---

## Förutsättningar
- Node.js installerat (`node -v`)
- npm installerat (`npm -v`)
- Projektmapp: `Backyard_Ultra/backyard`

---

## Del 1 – Setup i ditt projekt (20 min)

### 1. Gå till backend-mappen
```bash
cd /Users/zaidawiss/Desktop/projekt/Backyard_Ultra/backyard/backend
```

### 2. Initiera backend-projekt (om det inte redan finns)
```bash
npm init -y
npm install express cors morgan
npm install -D nodemon
```

### 3. Lägg till scripts i `backend/package.json`
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### 4. Skapa mappstruktur
```bash
mkdir -p src/routes src/controllers src/middleware
```

### 5. Skapa första filer
- `src/server.js`
- `src/app.js`
- `src/routes/runners.js`

---

## Del 2 – Första servern (25 min)

### `src/app.js`
- Importera `express`, `cors`, `morgan`
- `app.use(cors())`
- `app.use(express.json())`
- `app.use(morgan('dev'))`
- Montera `runners`-router på `/api/v1/runners`

### `src/server.js`
- Importera app
- Starta server på port `3000`
- Logga URL i terminalen

### `src/routes/runners.js`
Skapa till att börja med:
- `GET /` → returnera en tom array eller mock-runners
- `GET /:id` → returnera runner med id från `req.params`
- `POST /` → läs `req.body` och returnera `201`

---

## Del 3 – req.params, req.query, req.body i praktiken (25 min)

Bygg ut `GET /api/v1/runners` så den kan:
- Filtrera via query `?status=active`
- Begränsa via query `?limit=10`

Exempel:
- `GET /api/v1/runners?status=active&limit=2`

Kontrollera att du:
- Konverterar `limit` från sträng till tal.
- Hanterar ogiltig input med `400 Bad Request`.

---

## Del 4 – Statuskoder och felformat (20 min)

Använd dessa regler i dina routes:
- `200 OK`: lyckad hämtning
- `201 Created`: lyckad skapning
- `400 Bad Request`: felaktig indata
- `404 Not Found`: runner finns inte
- `500 Internal Server Error`: oväntat fel

Inför ett enkelt enhetligt felformat:
```json
{
  "error": {
    "code": "RUNNER_NOT_FOUND",
    "message": "Ingen löpare med id 12 hittades",
    "status": 404
  }
}
```

---

## Del 5 – Miniuppgift kopplad till Backyard Ultra (30–45 min)

Bygg dessa endpoints:

1. `GET /api/v1/runners`
   - Returnerar alla löpare
2. `GET /api/v1/runners/:id`
   - Returnerar en löpare eller `404`
3. `POST /api/v1/runners`
   - Kräver `name`
   - Sätter `status: "active"`
4. `POST /api/v1/runners/:id/laps`
   - Tar emot `time`
   - Lägger till varvtid på rätt runner

Använd in-memory-data (array) i vecka 1.

---

## Testa med curl (eller Postman)

```bash
curl http://localhost:3000/api/v1/runners
```

```bash
curl http://localhost:3000/api/v1/runners/1
```

```bash
curl -X POST http://localhost:3000/api/v1/runners \
  -H "Content-Type: application/json" \
  -d '{"name":"Zaid"}'
```

```bash
curl -X POST http://localhost:3000/api/v1/runners/1/laps \
  -H "Content-Type: application/json" \
  -d '{"time":54.3}'
```

---

## Checkpoint – Klart för vecka 1

Bocka av:
- [ ] Servern startar med `npm run dev`
- [ ] Minst 3 routes fungerar
- [ ] `req.params`, `req.query`, `req.body` används korrekt
- [ ] Korrekt statuskod returneras i minst 4 scenarier
- [ ] Minst ett enhetligt felformat används

---

## Reflektion (skriv 5–10 min)

1. Vad var skillnaden mellan att bygga frontend och backend i detta pass?
2. Vilket var ditt vanligaste misstag med statuskoder?
3. Vad vill du förbättra i din API-struktur till vecka 2?

---

## Förslag på commit efter workshop

```bash
git add .
git commit -m "feat(backend): vecka 1 express server, runners routes och statuskoder"
```

---

## Nästa steg (vecka 2 preview)
- Bryt ut mer logik i `controllers/`
- Lägg till egen middleware
- Förbered API-versionering och tydligare route-struktur
