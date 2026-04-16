# FJSX25 – Mentorsplan för Backyard_Ultra

> Fokus: guida dig genom skolprojektet steg för steg (inte skriva allt åt dig).
> Startdatum: 2026-04-16

## 1) Din nulägesbild (från koden)
**Styrkor**
- Bra start med React + TypeScript + tydlig komponentuppdelning.
- Du har redan tabellvy och grunddataflöde för löpare.
- Du har börjat med formulärvalidering i UI.

**Viktigaste förbättringar direkt**
- `Header` hanterar egen login-modal samtidigt som `App` också gör det (dubbellogik).
- Blandning av `.jsx` och `.tsx` i samma React/TS-projekt.
- `Dashboard` är tunn och hämtar direkt mockdata istället för state/API-lager.
- Validering ligger i frontend; backend-validering saknas (kritisk kurspunkt).
- Styling har konflikter (globala `body`/`button`-regler som kan ge bieffekter).

## 2) Målkarta: kursmål → konkreta leverabler i detta projekt
- **Mål 1,7 (Node/Express + struktur):** skapa backend-app med `routes`, `controllers`, `middleware`, `models`, `config`.
- **Mål 2,8 (CRUD + databas + test):** CRUD för `runners`, `laps`, `events`; testa med Jest/Supertest.
- **Mål 3 (TypeScript):** typa alla API-kontrakt (`CreateRunnerDto`, `LapDto`, `ApiError`).
- **Mål 4,9 (validering/felhantering):** Zod-schemas för `body/params/query` + central error-handler.
- **Mål 10 (OWASP/auth/RBAC/env):** bcrypt + JWT + roller (`admin`, `timekeeper`, `viewer`) + `.env`.
- **Mål 5,11,12 (fullstack + dokumentation + deploy):** koppla frontend till API, dokumentera dataflöde, deploya backend.

## 3) Praktisk 6-veckors leveransplan (komprimerad)
1. **Vecka A – API-grund:** Express + TS + route-struktur + statuskoder + Postman-collection.
2. **Vecka B – Databas:** MongoDB/Mongoose, modeller för `Runner`, `Lap`, `User`, första CRUD.
3. **Vecka C – Validering:** Zod middleware + enhetligt felformat + 400/404/409/500-hantering.
4. **Vecka D – Säkerhet:** register/login, hashade lösenord, JWT, auth-middleware, RBAC-light.
5. **Vecka E – Kvalitet:** tester (happy path + edge cases), loggning, dataminimering.
6. **Vecka F – Fullstack + deploy:** frontend kopplas till API, README/API-dokumentation, driftsättning.

## 4) Definition of Done (för VG-nivå)
- Alla kärnendpoints har validering + tester.
- Inga hemligheter i repo, tydlig `.env.example`.
- Konsekvent felstruktur och korrekta HTTP-koder.
- Minst ett visualiserat dataflöde (Mermaid eller draw.io).
- Gruppansvar synligt: commits/PR/ansvarsfördelning dokumenterad.

## 5) Mentorupplägg (hur vi jobbar ihop)
Varje gång du pushar kod kan vi köra denna loop:
1. Du beskriver vad du försökte bygga.
2. Jag ger feedback på struktur, läsbarhet, säkerhet, prestanda och best practices.
3. Du får 2–3 prioriterade förbättringar (inte 20 samtidigt).
4. Du implementerar.
5. Vi gör mini-retro: vad du lärde dig + vad som är nästa steg.

## 6) Förslag på första sprint (nästa konkreta steg)
- Flytta all login-modal-state till **en** plats (helst `App`).
- Gör `Header` “dumb” (bara triggar callback).
- Definiera frontend-typer för API-svar (`Runner`, `Lap`, `ApiErrorResponse`).
- Lägg till en `services/api.ts` med fetch-funktioner (även mot mock i början).
- Skissa backend-mappstruktur i en ny `backend/`-mapp.

## 7) Frågor jag vill att du svarar på
1. Vilken del vill du prioritera först: **backendstruktur**, **säkerhet**, eller **tester**?
2. Jobbar du ensam eller i grupp i detta projekt just nu?
3. Är målet att nå **G snabbt** eller satsa på **VG** från start?
4. Vill du att jag skapar en separat övningsmapp med uppgifter för Node/Express/Zod/JWT?
