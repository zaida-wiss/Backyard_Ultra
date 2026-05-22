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
      ref: "RunnerAccount",
      default: null,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    club: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: ["registered"],
      default: "registered",
    },
  },
  { timestamps: true },
);

export type RunnerFields = InferSchemaType<typeof runnerSchema>;
export type RunnerDocument = HydratedDocument<RunnerFields>;

export const RunnerModel = model("Runner", runnerSchema);

export const toRunnerResponse = (runner: RunnerDocument) => {
  return {
    id: runner.id,
    competitionId: runner.competitionId.toString(),
    runnerAccountId: runner.runnerAccountId?.toString() ?? null,
    firstName: runner.firstName,
    lastName: runner.lastName,
    email: runner.email ?? null,
    club: runner.club ?? null,
    status: runner.status,
    createdAt: runner.createdAt.toISOString(),
    updatedAt: runner.updatedAt.toISOString(),
  };
};
