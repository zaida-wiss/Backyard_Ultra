# Vecka 12: Examination, redovisning och slutleverans

## Inlärningsmål

Efter veckan ska du kunna:

- färdigställa projektet
- visa att backend fungerar
- förklara dina tekniska val
- koppla projektet till kursens lärandemål
- lämna in kod och dokumentation
- förbereda dig för skriftligt kunskapstest

Det viktigaste här är inte att projektet är störst, utan att du kan förklara varför varje del finns. Det är ett starkt tecken på att du faktiskt kan backend.

## Slutleverans

Projektet bör innehålla:

- Express API i TypeScript
- MongoDB/Mongoose
- validering
- central felhantering
- auth med hashade lösenord och token
- rollkontroll
- frontend-koppling
- dokumenterade endpoints
- README
- tester eller tydliga testinstruktioner

## Demo-flöde

```md
1. Starta backend.
2. Starta frontend.
3. Registrera arrangör.
4. Logga in som arrangör.
5. Skapa tävling.
6. Registrera löpare.
7. Logga in som löpare.
8. Anmäl löpare till tävling.
9. Filtrera tävlingar.
10. Visa skyddad route utan token och förklara 401.
```

## Kommandon inför inlämning

```bash
npm install
npm run build
npm test
npm run dev
```

Om något av detta misslyckas ska du kunna säga varför.

## JavaScript-exempel: snabb smoke test

```js
const response = await fetch('http://localhost:3000/api/v1/competitions');

if (!response.ok) {
  throw new Error('API svarar inte som väntat');
}
```

## TypeScript-exempel: typad smoke test

```ts
type Competition = {
  id: string;
  name: string;
  type: string;
  place: string;
  startAt: string;
  endAt: string;
};

const response = await fetch('http://localhost:3000/api/v1/competitions');
const competitions = (await response.json()) as Competition[];

console.log(`API:t returnerade ${competitions.length} tävlingar`);
```

Skillnaden är att TypeScript hjälper dig beskriva formen på svaret du förväntar dig.

## Koppla projektet till lärandemålen

```md
## Lärandemål 1: Node.js och Express

Projektet använder Express för routes, middleware och controllers.

## Lärandemål 2: Databaser

Projektet använder MongoDB och Mongoose för arrangörer, löpare och tävlingar.

## Lärandemål 3: Säkerhet

Projektet hash:ar lösenord, använder JWT och skyddar routes.

## Lärandemål 4: API-design

Projektet har REST-endpoints med tydliga resurser.
```

## Redovisningsmall

```md
1. Det här byggde jag.
2. Så är backend strukturerad.
3. Så fungerar auth.
4. Så fungerar databasen.
5. Så hanterar jag validering och fel.
6. Så har jag tänkt kring säkerhet och GDPR.
7. Det här var svårt.
8. Det här skulle jag förbättra härnäst.
```

## Reflektionsfrågor

- Vad händer i backend när en arrangör skapar en tävling?
- Varför hash:ar vi lösenord?
- Varför räcker det inte med frontend-validering?
- Vad är skillnaden mellan 401 och 403?
- Varför ska `.env` inte committas?
- Vad hade du brutit ut i services om projektet blev större?

## Vanliga sista-minuten-problem

- `MONGO_URI` är fel eller saknas.
- `AUTH_SECRET` saknas.
- Frontend skickar inte token.
- CORS tillåter fel origin.
- TypeScript bygger inte på grund av saknade typer.
- README säger något annat än koden gör.

## Finns det fler bra lösningar?

Ja. Du kan redovisa med live-demo, inspelad demo eller tydliga screenshots beroende på instruktionerna. Du kan också ha mer eller mindre testning. Det viktiga är att du kan visa att backend fungerar och förklara dina val.

## Checklista

- [ ] Backend startar.
- [ ] Frontend startar.
- [ ] Build fungerar.
- [ ] Tester fungerar eller testinstruktioner finns.
- [ ] `.env.example` är uppdaterad.
- [ ] README är uppdaterad.
- [ ] Inga secrets ligger i Git.
- [ ] Du kan demonstrera auth.
- [ ] Du kan demonstrera CRUD.
- [ ] Du kan demonstrera filtrering.
- [ ] Du kan förklara säkerhet, GDPR och databasval.
