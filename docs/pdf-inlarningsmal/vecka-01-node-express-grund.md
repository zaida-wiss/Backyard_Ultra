# Vecka 1: Node.js, HTTP och Express-grund

## Inlärningsmål

Efter veckan ska du kunna:

- förklara klient-server-modellen
- förklara HTTP-metoder och statuskoder
- starta en Express-server
- skapa routes med `GET` och `POST`
- använda `req` och `res`
- förstå eventloopen och non-blocking I/O på grundnivå
- använda `npm` och `package.json`

## Bygg detta

Bygg ett minimalt API för tävlingar:

- `GET /api/v1/competitions`
- `GET /api/v1/competitions/:id`
- `POST /api/v1/competitions`

## JavaScript-exempel

```js
const express = require('express');

const app = express();
app.use(express.json());

const competitions = [
  { id: 1, name: 'Backyard Ultra', place: 'Umeå' },
];

app.get('/api/v1/competitions', (req, res) => {
  res.json(competitions);
});

app.get('/api/v1/competitions/:id', (req, res) => {
  const id = Number(req.params.id);
  const competition = competitions.find((item) => item.id === id);

  if (!competition) {
    return res.status(404).json({ message: 'Tävlingen finns inte' });
  }

  return res.json(competition);
});

app.post('/api/v1/competitions', (req, res) => {
  const competition = {
    id: competitions.length + 1,
    name: req.body.name,
    place: req.body.place,
  };

  competitions.push(competition);
  return res.status(201).json(competition);
});

app.listen(3000, () => {
  console.log('Servern körs på http://localhost:3000');
});
```

## TypeScript-exempel

```ts
import express, { Request, Response } from 'express';

type Competition = {
  id: number;
  name: string;
  place: string;
};

const app = express();
app.use(express.json());

const competitions: Competition[] = [
  { id: 1, name: 'Backyard Ultra', place: 'Umeå' },
];

app.get('/api/v1/competitions', (req: Request, res: Response) => {
  res.json(competitions);
});

app.get('/api/v1/competitions/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const competition = competitions.find((item) => item.id === id);

  if (!competition) {
    return res.status(404).json({ message: 'Tävlingen finns inte' });
  }

  return res.json(competition);
});
```

## Viktigt att förstå

`req.params` kommer från URL:en:

```text
/api/v1/competitions/1
```

`req.body` kommer från JSON som klienten skickar:

```json
{
  "name": "Backyard Ultra",
  "place": "Umeå"
}
```

## Checklista

- [ ] Jag kan starta en Express-server.
- [ ] Jag kan skapa en `GET`-route.
- [ ] Jag kan skapa en `POST`-route.
- [ ] Jag använder `201` när något skapas.
- [ ] Jag använder `404` när något saknas.

