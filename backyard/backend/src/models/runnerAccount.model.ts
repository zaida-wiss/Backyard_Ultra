import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const runnerAccountSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    club: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

export type RunnerAccountFields = InferSchemaType<typeof runnerAccountSchema>;
export type RunnerAccountDocument = HydratedDocument<RunnerAccountFields>;

export const RunnerAccountModel = model("RunnerAccount", runnerAccountSchema);

export const toPublicRunnerAccount = (runnerAccount: RunnerAccountDocument) => {
  return {
    id: runnerAccount.id,
    firstName: runnerAccount.firstName,
    lastName: runnerAccount.lastName,
    email: runnerAccount.email,
    club: runnerAccount.club ?? null,
    createdAt: runnerAccount.createdAt.toISOString(),
    updatedAt: runnerAccount.updatedAt.toISOString(),
  };
};
