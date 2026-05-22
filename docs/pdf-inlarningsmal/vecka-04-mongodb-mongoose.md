# Vecka 4: MongoDB och Mongoose

## Inlärningsmål

Efter veckan ska du kunna:

- förklara skillnaden mellan relationsdatabaser och dokumentdatabaser
- ansluta Express till MongoDB med Mongoose
- skapa schemas och modeller
- skapa dokument
- hantera `null`-resultat
- undvika att committa `.env`
- förstå skillnaden mellan schema, model och document

## Bygg detta

Byt från in-memory arrays till Mongoose-modeller för:

- `Organizer`
- `RunnerAccount`
- `Competition`
- `Registration`

## JavaScript-exempel: anslutning

```js
const mongoose = require('mongoose');

async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI saknas');
  }

  await mongoose.connect(mongoUri);
  console.log('Ansluten till MongoDB');
}

module.exports = { connectToDatabase };
```

## TypeScript-exempel: anslutning

```ts
import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI saknas i miljövariablerna');
  }

  await mongoose.connect(mongoUri);
  console.log('Ansluten till MongoDB');
};
```

## TypeScript-exempel: Mongoose schema

```ts
import { Schema, model, InferSchemaType } from 'mongoose';

const competitionSchema = new Schema(
  {
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export type CompetitionDocument = InferSchemaType<typeof competitionSchema>;
export const CompetitionModel = model('Competition', competitionSchema);
```

## TypeScript-exempel: skapa dokument

```ts
export const createCompetition = async (data: {
  organizerId: string;
  name: string;
  type: string;
  place: string;
  startAt: Date;
  endAt: Date;
}) => {
  return CompetitionModel.create(data);
};
```

## Checklista

- [ ] `.env` finns i `.gitignore`.
- [ ] `MONGO_URI` finns i `.env.example` utan hemligheter.
- [ ] Servern ansluter till MongoDB innan `app.listen`.
- [ ] Minst en Mongoose-modell finns.
- [ ] Minst en route använder databasen i stället för array.
- [ ] `null` från databasen hanteras med `404`.

