# Kursplan – Backendutveckling i Node.js, databaser och säkerhet (Chas Academy)

> Sparad: 2026-04-16
> Omfattning: 60 yhp, 12 veckor

## Syfte i korthet
Kursen tränar dig att bygga säkra, typade och testbara backend-system med Node.js/Express, databaser (främst MongoDB + Mongoose, samt introduktion till SQL), samt att koppla detta till fullstack-flöden och enklare driftsättning.

## Kärnområden
- Stateless REST API-design i Node.js/Express
- TypeScript i backend (rutter, modeller, kontrakt)
- CRUD mot databas + testning
- Inputvalidering, felhantering och "don’t trust the client"
- OWASP-topprisker, autentisering, JWT, RBAC
- Miljövariabler och säker konfigurationshantering
- GDPR, dataminimering, säker loggning
- Dataflödesdokumentation och enklare molndrift
- Teamarbete i gemensam kodbas

## Kursmål (översikt)
### Kunskaper (1–6)
1. Förklara Node.js/Express och stateless REST API.
2. Förklara datalagring + CRUD i relationella och dokumentdatabaser.
3. Förklara TypeScript-typning i backend.
4. Förklara säkerhetsprinciper (OWASP, auth, felhantering, GDPR, etc).
5. Förklara fullstack-samverkan och RBAC.
6. Förklara miljövariabler och separerad konfiguration.

### Färdigheter (7–12)
7. Bygga och strukturera backend i Node/Express.
8. Implementera + testa CRUD mot datalager.
9. Implementera robust validering och säker felhantering.
10. Implementera grundläggande OWASP-skydd, auth, RBAC, env-hantering.
11. Driftsätta grundläggande till moln + dokumentera API/systemflöden.
12. Visualisera dataflöde och samarbeta i teamprojekt.

## Examination
- Skriftligt kunskapstest (individuellt)
- Skriftlig reflektion (individuellt)
- Projektinlämning (grupp, individuell bedömning)

## Betygsnivåer
- IG: alla mål ej uppfyllda
- G: alla mål uppfyllda
- VG: alla mål uppfyllda + hög precision/skicklighet i kärnförmågor (struktur, CRUD+test, validering/felhantering)

## Rekommenderad tolkning för ditt projekt
För att klara kursen starkt bör projektet visa:
- Tydlig mappstruktur + ansvarsfördelning (routes/controllers/middleware/models)
- Typade kontrakt (TypeScript) och enhetlig API-respons
- Bevisad validering/felhantering i samtliga endpoints
- Tester för kritiska CRUD-flöden
- Säkerhetsmoment (hashning, JWT, RBAC-light, env-hygien)
- Dokumenterade dataflöden och driftsättningssteg
