import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const organizerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "organizer"],
      default: "organizer",
      required: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export type OrganizerFields = InferSchemaType<typeof organizerSchema>;
export type OrganizerDocument = HydratedDocument<OrganizerFields>;

export const OrganizerModel = model("Organizer", organizerSchema);

export const toPublicOrganizer = (organizer: OrganizerDocument) => {
  return {
    id: organizer.id,
    name: organizer.name,
    email: organizer.email,
    role: organizer.role,
    createdAt: organizer.createdAt.toISOString(),
    updatedAt: organizer.updatedAt.toISOString(),
  };
};
