# Vecka 5: Relationer, filtrering och API-testning

## Inlärningsmål

Efter veckan ska du kunna:

- filtrera data med query-parametrar
- sortera och paginera API-resultat
- förstå embedding vs referencing i MongoDB
- använda `populate`
- skapa index i Mongoose
- skriva integrationstester med Jest/Supertest
- testa mot en in-memory-databas

## Bygg detta

Bygg endpoints som kan filtrera tävlingar:

```http
GET /api/v1/competitions?type=backyard&place=umeå&page=1&limit=10
```

## JavaScript-exempel: query-filter

```js
router.get('/competitions', async (req, res) => {
  const filter = {};

  if (req.query.type) {
    filter.type = new RegExp(req.query.type, 'i');
  }

  const competitions = await Competition.find(filter);
  res.json(competitions);
});
```

## TypeScript-exempel: filter, sortering och paginering

I projektet delar vi upp query-filter i tre lager:

```text
middleware/competitionFilters.ts
  -> läser req.query och lägger filter på req
schemas/competitionFiltersSchema.ts
  -> validerar och normaliserar query
services/competitionFilters.ts
  -> filtrerar data utan att känna till Express
```

```ts
import type { FilterQuery } from 'mongoose';
import { CompetitionModel, CompetitionDocument } from '../models/competition.model';

type CompetitionQuery = {
  type?: string;
  place?: string;
  page?: string;
  limit?: string;
};

export const listCompetitions = async (query: CompetitionQuery) => {
  const filter: FilterQuery<CompetitionDocument> = {};
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  if (query.type) {
    filter.type = new RegExp(query.type, 'i');
  }

  if (query.place) {
    filter.place = new RegExp(query.place, 'i');
  }

  return CompetitionModel.find(filter)
    .sort({ startAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};
```

## Referencing vs embedding

Embedding passar när informationen hör starkt ihop:

```ts
const runnerSchema = new Schema({
  name: String,
  emergencyContact: {
    name: String,
    phone: String,
  },
});
```

Referencing passar när dokument kan leva egna liv:

```ts
const registrationSchema = new Schema({
  competitionId: {
    type: Schema.Types.ObjectId,
    ref: 'Competition',
    required: true,
  },
  runnerId: {
    type: Schema.Types.ObjectId,
    ref: 'RunnerAccount',
    required: true,
  },
});
```

## Populate

```ts
const registrations = await RegistrationModel
  .find({ runnerId })
  .populate('competitionId');
```

## Index

```ts
registrationSchema.index(
  { competitionId: 1, runnerId: 1 },
  { unique: true },
);
```

## Testexempel

I projektet samlar vi testfiler i `src/__tests__/`, så testkod inte blandas med routes, controllers och models.

```text
src/
  __tests__/
    app.test.ts
```

```ts
import request from 'supertest';
import app from '../src/app';

it('returns competitions', async () => {
  const response = await request(app)
    .get('/api/v1/competitions')
    .expect(200);

  expect(Array.isArray(response.body)).toBe(true);
});
```

## Checklista

- [ ] API:t kan filtrera med `req.query`.
- [ ] API:t kan sortera resultat.
- [ ] API:t kan paginera resultat.
- [ ] Relationer använder referencing där det passar.
- [ ] `populate` används där klienten behöver relaterad data.
- [ ] Unika kombinationer skyddas med index.
- [ ] Testfiler ligger i `__tests__/`.
- [ ] Integrationstester täcker minst ett lyckat och ett felaktigt flöde.
