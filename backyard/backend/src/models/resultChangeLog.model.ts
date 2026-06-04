import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const resultChangeLogSchema = new Schema(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    runnerId: {
      type: Schema.Types.ObjectId,
      ref: "Runner",
      required: true,
    },
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRoles: {
      type: [String],
      default: [],
    },
    lapNumber: {
      type: Number,
      default: null,
    },
    changeType: {
      type: String,
      enum: ["lap_times_updated", "manual_correction", "dnf_registered"],
      required: true,
    },
    previousValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

export type ResultChangeLogFields = InferSchemaType<typeof resultChangeLogSchema>;
export type ResultChangeLogDocument = HydratedDocument<ResultChangeLogFields>;

export const ResultChangeLogModel = model("ResultChangeLog", resultChangeLogSchema);

export const toResultChangeLogResponse = (log: ResultChangeLogDocument) => {
  return {
    id: log.id,
    competitionId: log.competitionId.toString(),
    runnerId: log.runnerId.toString(),
    actorUserId: log.actorUserId.toString(),
    actorRoles: log.actorRoles,
    lapNumber: log.lapNumber ?? null,
    changeType: log.changeType,
    previousValue: log.previousValue ?? null,
    newValue: log.newValue ?? null,
    reason: log.reason ?? null,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
  };
};
