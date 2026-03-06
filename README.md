# Backyard Ultra Live Tracker

## Syfte
Denna app gör det möjligt att följa löpare live under en Backyard Ultra-tävling. Varje löpare springer ett varv varje timme tills endast en löpare återstår. Appen visualiserar deltagarlistan, varvtider och medeltider per varv.

## Funktioner
- Visa alla deltagare i en vänsterkolumn.
- Visa varvtider för varje löpare i en högerkolumn.
- Rubrik överst med aktuell varvnummer.
- Formulär för att lägga till varvtid för en löpare.
- Beräkning och visning av medeltid per varv för varje löpare.
- Mockdata används initialt, backend kan kopplas på senare.

## Användarflöde
1. Användaren ser en lista med löpare och deras varvtider.
2. När en löpare har sprungit ett varv, fylls tiden i via ett formulär.
3. När en löpare går i mål på ett varv klickar användaren på en knapp för att registrera tiden för just den löparen.
4. Endast löpare som är kvar i tävlingen visas som valbara för nästa varv.
5. Dashboarden uppdateras och visar nya varvtider och medeltider.
6. Varvnummer och status visas tydligt i UI:t.
7. En ny varvkolumn skapas automatiskt när minst två löpare har gått i mål på föregående varv. Tävlingen fortsätter tills endast en löpare återstår.

## Teknikstack
- React
- TypeScript
- (Planerat) Node.js backend
- (Valfritt) Google Sheets eller databas för lagring

## Framtida förbättringar
- Realtidsuppdatering med websockets.
- Statistik och visualiseringar.
- Admin-panel för att hantera tävlingen.
- Integration med Google Sheets eller annan databas.

## Installation
1. Klona projektet.
2. Installera beroenden med `npm install`.
3. Starta appen med `npm start`.
# Backyard_Ultra
Backyard_Ultra
