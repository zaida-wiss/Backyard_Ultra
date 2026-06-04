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
    templateKey: {
      type: String,
      enum: ["backyard-ultra"],
      default: "backyard-ultra",
    },
    status: {
      type: String,
      enum: ["draft", "open", "closed", "in_progress", "finished"],
      default: "open",
    },
    place: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, default: null },
    registrationDeadline: { type: Date, default: null },
    isPublic: { type: Boolean, default: true },
    registrationMode: {
      type: String,
      enum: ["self_service", "organizer_only", "both"],
      default: "both",
    },
    allowTeamRegistration: { type: Boolean, default: false },
    allowRepresentingOrganization: { type: Boolean, default: true },
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
    templateKey: competition.templateKey,
    status: competition.status,
    place: competition.place,
    startAt: toDateTimeLocal(competition.startAt),
    endAt: toOptionalDateTimeLocal(competition.endAt),
    registrationDeadline: toOptionalDateTimeLocal(competition.registrationDeadline),
    isPublic: competition.isPublic,
    registrationMode: competition.registrationMode,
    allowTeamRegistration: competition.allowTeamRegistration,
    allowRepresentingOrganization: competition.allowRepresentingOrganization,
    createdAt: competition.createdAt.toISOString(),
    updatedAt: competition.updatedAt.toISOString(),
  };
};
