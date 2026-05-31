import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

import type { AuthRole, PublicOrganizer, PublicRunnerAccount, PublicUser } from "../types/domain.js";

const userSchema = new Schema(
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
    organizerName: { type: String, default: null, trim: true },
    roles: {
      type: [String],
      enum: ["user", "admin", "organizer", "runner"],
      default: ["user", "runner"],
      required: true,
    },
  },
  { timestamps: true },
);

export type UserFields = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserFields>;

const UserModel = model("User", userSchema);

const hasRole = (user: UserDocument, role: AuthRole) => {
  return (user.roles as AuthRole[]).includes(role);
};

const addRole = (user: UserDocument, role: AuthRole) => {
  if (!hasRole(user, role)) {
    user.roles.push(role);
  }
};

const toPublicUser = (user: UserDocument): PublicUser => {
  const roles = user.roles as AuthRole[];

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    club: user.club ?? null,
    organizerName: user.organizerName ?? null,
    roles,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

const toOrganizerAccount = (user: UserDocument): PublicOrganizer => {
  const publicUser = toPublicUser(user);

  return {
    id: publicUser.id,
    name: publicUser.organizerName ?? `${publicUser.firstName} ${publicUser.lastName}`,
    email: publicUser.email,
    role: publicUser.roles.includes("admin") ? "admin" : "organizer",
    createdAt: publicUser.createdAt,
    updatedAt: publicUser.updatedAt,
  };
};

const toRunnerAccount = (user: UserDocument): PublicRunnerAccount => {
  const publicUser = toPublicUser(user);

  return {
    id: publicUser.id,
    firstName: publicUser.firstName,
    lastName: publicUser.lastName,
    email: publicUser.email,
    club: publicUser.club,
    createdAt: publicUser.createdAt,
    updatedAt: publicUser.updatedAt,
  };
};

export { addRole, hasRole, toOrganizerAccount, toPublicUser, toRunnerAccount, UserModel };
