import { RunnerModel } from "../models/runner.model.js";
import { UserModel, type UserDocument } from "../models/user.model.js";

const ACCOUNT_DELETION_GRACE_PERIOD_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getAccountDeletionScheduledAt = (requestedAt = new Date()) => {
  return new Date(requestedAt.getTime() + ACCOUNT_DELETION_GRACE_PERIOD_DAYS * MS_PER_DAY);
};

const isAccountDeletionPending = (user: UserDocument) => {
  return Boolean(user.deletionScheduledAt && !user.deletedAt);
};

const isAccountDeletionDue = (user: UserDocument, now = new Date()) => {
  return Boolean(user.deletionScheduledAt && user.deletionScheduledAt <= now);
};

const scheduleAccountDeletion = (user: UserDocument, requestedAt = new Date()) => {
  user.deletionRequestedAt = requestedAt;
  user.deletionScheduledAt = getAccountDeletionScheduledAt(requestedAt);
};

const cancelAccountDeletion = (user: UserDocument) => {
  if (!isAccountDeletionPending(user)) {
    return false;
  }

  user.deletionRequestedAt = null;
  user.deletionScheduledAt = null;

  return true;
};

const detachRunnerRegistrationsFromAccount = async (userId: string, email: string) => {
  await RunnerModel.updateMany(
    {
      $or: [
        { runnerAccountId: userId },
        { email },
      ],
    },
    {
      $set: {
        runnerAccountId: null,
        email: null,
      },
    },
  );
};

const finalizeAccountDeletion = async (user: UserDocument, deletedAt = new Date()) => {
  await detachRunnerRegistrationsFromAccount(user.id, user.email);

  user.firstName = "Raderad";
  user.lastName = "Användare";
  user.email = `deleted-${user.id}@deleted.local`;
  user.club = null;
  user.organizerName = null;
  user.roles = ["user"];
  user.passwordHash = `deleted-${user.id}`;
  user.deletedAt = deletedAt;
  user.deletionRequestedAt = null;
  user.deletionScheduledAt = null;

  await user.save();
};

const processDueAccountDeletions = async (now = new Date()) => {
  const dueUsers = await UserModel.find({
    deletedAt: null,
    deletionScheduledAt: { $lte: now },
  });

  for (const user of dueUsers) {
    await finalizeAccountDeletion(user, now);
  }

  return dueUsers.length;
};

export {
  ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
  cancelAccountDeletion,
  finalizeAccountDeletion,
  getAccountDeletionScheduledAt,
  isAccountDeletionDue,
  isAccountDeletionPending,
  processDueAccountDeletions,
  scheduleAccountDeletion,
};
