import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const timekeeperAssignmentSchema = new Schema(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

timekeeperAssignmentSchema.index(
  { competitionId: 1, userId: 1 },
  { unique: true },
);

export type TimekeeperAssignmentFields = InferSchemaType<typeof timekeeperAssignmentSchema>;
export type TimekeeperAssignmentDocument = HydratedDocument<TimekeeperAssignmentFields>;

export const TimekeeperAssignmentModel = model("TimekeeperAssignment", timekeeperAssignmentSchema);

export const toTimekeeperAssignmentResponse = (assignment: TimekeeperAssignmentDocument) => {
  return {
    id: assignment.id,
    competitionId: assignment.competitionId.toString(),
    userId: assignment.userId.toString(),
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
  };
};
