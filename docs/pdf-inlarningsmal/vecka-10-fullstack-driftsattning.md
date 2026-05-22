# Vecka 10: Fullstack-koppling och driftsättning

## Inlärningsmål

Efter veckan ska du kunna:

- koppla React frontend till Express backend
- konfigurera CORS
- använda proxy i utvecklingsmiljö
- skicka JWT från frontend till backend
- beskriva hela dataflödet från UI till databas
- förstå grunderna i deployment
- använda produktionsvariabler
- tänka på HTTPS, CORS policy och rate limiting

Du är på rätt spår när du tänker "frontend ska inte prata direkt med databasen". Frontend pratar med backend, och backend pratar med databasen.

## Bygg detta

Bygg ett fullstack-flöde:

1. Arrangör registrerar konto i frontend.
2. Arrangör loggar in och får token.
3. Frontend sparar token.
4. Arrangör skapar tävling.
5. Backend sparar tävlingen i MongoDB.
6. Löpare loggar in och anmäler sig.

## JavaScript-exempel: CORS

```js
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
}));
```

## TypeScript-exempel: CORS med config

```ts
import cors from 'cors';
import { config } from './config/config';

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
```

Varför? I produktion vill du inte tillåta vilken frontend-origin som helst.

## Vite proxy i utveckling

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
```

Med proxy kan frontend anropa `/api/v1/competitions` utan att hårdkoda backend-adressen överallt.

## JavaScript-exempel: fetch utan token

```js
const response = await fetch('/api/v1/competitions');
const competitions = await response.json();
```

Det räcker för publika endpoints, men inte för skyddade routes.

## TypeScript-exempel: fetch med JWT

```ts
type CreateCompetitionInput = {
  name: string;
  type: string;
  place: string;
  startAt: string;
  endAt: string;
};

export const createCompetition = async (
  token: string,
  input: CreateCompetitionInput,
) => {
  const response = await fetch('/api/v1/competitions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Kunde inte skapa tävling');
  }

  return response.json();
};
```

## Rate limiting

```ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, loginOrganizer);
```

Varför? Login-routes är extra känsliga för brute force-försök.

## Produktionsvariabler

```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://...
AUTH_SECRET=lång-hemlig-slumpad-sträng
CORS_ORIGIN=https://din-frontend.se
```

## Deployment-checklista

- backend har `npm run build`
- backend har `npm start`
- produktionsmiljön har rätt env vars
- MongoDB Atlas tillåter serverns IP eller nätverk
- CORS tillåter frontendens riktiga URL
- frontend använder rätt API-bas-URL
- HTTPS används i produktion

## Full data flow

```text
Formulär i React
  -> fetch med JSON och JWT
  -> Express route
  -> auth middleware
  -> validation middleware
  -> controller
  -> service/model
  -> MongoDB
  -> JSON-svar tillbaka till React
```

## Frågor att öva på

- Varför får frontend inte ha `MONGO_URI`?
- Varför måste backend kontrollera token även om frontend redan visar rätt knapp?
- Vad behöver ändras mellan lokal utveckling och produktion?

## Finns det fler bra lösningar?

Ja. Du kan använda cookies i stället för localStorage för token. Du kan deploya på Render, Railway, Fly.io, Vercel eller annan plattform. Det viktiga är att miljövariabler och CORS blir rätt.

## Checklista

- [ ] Frontend kan registrera användare.
- [ ] Frontend kan logga in och spara token.
- [ ] Skyddade frontend-anrop skickar `Authorization`.
- [ ] Backend har CORS konfigurerat.
- [ ] Backend kan byggas inför produktion.
- [ ] Rate limiting finns på känsliga endpoints.
- [ ] Du kan förklara hela flödet från knapptryck till databas.
