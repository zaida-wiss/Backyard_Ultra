import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const competitionSchema = new Schema(
  {
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    place: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type CompetitionFields = InferSchemaType<typeof competitionSchema>;
export type CompetitionDocument = HydratedDocument<CompetitionFields>;

export const CompetitionModel = model("Competition", competitionSchema);

const toDateTimeLocal = (date: Date) => date.toISOString().slice(0, 16);
const toOptionalDateTimeLocal = (date: Date | null | undefined) => {
  return date ? toDateTimeLocal(date) : null;
};

export const toCompetitionResponse = (competition: CompetitionDocument) => {
  return {
    id: competition.id,
    organizerId: competition.organizerId.toString(),
    name: competition.name,
    type: competition.type,
    place: competition.place,
    startAt: toDateTimeLocal(competition.startAt),
    endAt: toOptionalDateTimeLocal(competition.endAt),
    createdAt: competition.createdAt.toISOString(),
    updatedAt: competition.updatedAt.toISOString(),
  };
};
