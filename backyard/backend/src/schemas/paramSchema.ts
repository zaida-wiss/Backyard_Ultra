import { Types } from "mongoose";
import HttpError from "../errors/httpError.js";

type ObjectIdParams = Record<string, string>;

const parseObjectIdParams = (
  params: Record<string, unknown>,
  fieldNames: string[],
): ObjectIdParams => {
  const parsedParams: ObjectIdParams = {};

  for (const fieldName of fieldNames) {
    const id = params[fieldName];

    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "BAD_REQUEST", `${fieldName} måste vara ett giltigt MongoDB-id`);
    }

    parsedParams[fieldName] = id;
  }

  return parsedParams;
};

export type { ObjectIdParams };
export { parseObjectIdParams };
