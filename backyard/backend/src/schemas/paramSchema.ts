import { Types } from "mongoose";
import HttpError from "../errors/httpError";

export type IdParams = {
  id: string;
};

export const parseIdParam = (params: Record<string, unknown>): IdParams => {
  const id = params.id;

  if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
    throw new HttpError(400, "BAD_REQUEST", "id måste vara ett giltigt MongoDB-id");
  }

  return { id };
};