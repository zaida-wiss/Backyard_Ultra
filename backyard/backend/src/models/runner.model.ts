import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const runnerSchema = new Schema(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    runnerAccountId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    runnerNumber: { type: Number, default: null },
    registrationType: {
      type: String,
      enum: ["individual", "team"],
      default: "individual",
    },
    teamName: { type: String, default: null, trim: true },
    teamMembers: {
      type: [
        {
          firstName: { type: String, required: true, trim: true },
          lastName: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    club: { type: String, default: null, trim: true },
    lapTimes: {
      type: [Number],
      default: [],
    },
    status: {
      type: String,
      enum: ["registered", "active", "dnf", "finished"],
      default: "registered",
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

runnerSchema.index(
  { competitionId: 1, runnerAccountId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      runnerAccountId: { $type: "objectId" },
      deletedAt: null,
    },
  },
);

runnerSchema.index(
  { competitionId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string" },
      deletedAt: null,
    },
  },
);

export type RunnerFields = InferSchemaType<typeof runnerSchema>;
export type RunnerDocument = HydratedDocument<RunnerFields>;

export const RunnerModel = model("Runner", runnerSchema);

export const toRunnerResponse = (runner: RunnerDocument) => {
  return {
    id: runner.id,
    competitionId: runner.competitionId.toString(),
    runnerAccountId: runner.runnerAccountId?.toString() ?? null,
    runnerNumber: runner.runnerNumber ?? null,
    registrationType: runner.registrationType,
    teamName: runner.teamName ?? null,
    teamMembers: runner.teamMembers.map((member) => ({
      firstName: member.firstName,
      lastName: member.lastName,
    })),
    firstName: runner.firstName,
    lastName: runner.lastName,
    email: runner.email ?? null,
    club: runner.club ?? null,
    lapTimes: runner.lapTimes,
    status: runner.status,
    deletedAt: runner.deletedAt?.toISOString() ?? null,
    createdAt: runner.createdAt.toISOString(),
    updatedAt: runner.updatedAt.toISOString(),
  };
};
