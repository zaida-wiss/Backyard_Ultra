# GDPR, Loggning Och Radering

Det här dokumentet beskriver hur Backyard Ultra-projektet hanterar personuppgifter på kursnivå.

## Personuppgifter Som Sparas

Projektet sparar bara uppgifter som behövs för konto, tävling och anmälan:

- namn
- email
- klubb, om löparen anger det
- roll för arrangörskonto
- koppling mellan löpare och tävling

Projektet ska inte spara personnummer, adress, hälsodata eller fria känsliga anteckningar.

## Varför Uppgifterna Behövs

- Email används för inloggning och unik identifiering.
- Namn visas i arrangörs- och löparflöden.
- Klubb är frivillig tävlingsinformation.
- Roll används av backend för behörighet.
- Tävlingskoppling behövs för anmälningar och deltagarlistor.

## Loggning

Backend använder Pino och pino-http:

- `backyard/backend/src/utils/logger.ts` skapar Pino-loggern.
- `backyard/backend/src/middleware/requestLogger.ts` kopplar Pino till Express requests.

Vi loggar HTTP-information som metod, url, status och responstid. Vi loggar inte request body.

Följande fält redacteras:

- `authorization`
- `password`
- `passwordHash`
- `token`

## Soft Delete

Soft delete används när data inte ska synas aktivt, men historik kan behöva finnas kvar.

I projektet finns soft delete på anmälningar:

```ts
runner.deletedAt = new Date();
await runner.save();
```

Listningar filtrerar sedan på:

```ts
deletedAt: null
```

Om man glömmer filtret kan en raderad anmälan fortfarande synas i API-svar.

## Hard Delete

Hard delete betyder att raden tas bort från databasen.

Det passar när personuppgifter verkligen ska raderas, till exempel vid en begäran om radering.

```ts
await RunnerModel.deleteOne({ _id: runnerId });
```

I ett tävlingssystem kan hard delete göra att historik eller statistik går sönder. Ett vanligt alternativ är därför anonymisering.

## Anonymisering

Anonymisering kan användas när tävlingshistorik ska behållas men personuppgifter tas bort.

```ts
runner.firstName = "Raderad";
runner.lastName = "Användare";
runner.email = null;
runner.deletedAt = new Date();
await runner.save();
```

Då finns tävlingskopplingen kvar, men personen går inte längre att identifiera på namn/email.

## Frågor Att Kunna Svara På

1. Vilka personuppgifter sparar projektet?
2. Varför behövs varje uppgift?
3. Vilka fält får aldrig loggas?
4. När passar soft delete?
5. När passar hard delete eller anonymisering bättre?
