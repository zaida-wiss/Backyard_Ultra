import type { CreateOrganizerInput, Organizer, PublicOrganizer } from "../types/domain";
import { createId } from "../utils/ids";

export const createOrganizer = ({ name, email, passwordHash }: CreateOrganizerInput): Organizer => {
  return {
    id: createId('organizer'),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
};

export const toPublicOrganizer = (organizer: Organizer): PublicOrganizer => {
  return {
    id: organizer.id,
    name: organizer.name,
    email: organizer.email,
    createdAt: organizer.createdAt,
  };
};
