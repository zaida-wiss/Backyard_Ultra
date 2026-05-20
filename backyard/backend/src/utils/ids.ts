const counters = {
  organizer: 0,
  competition: 0,
  runnerAccount: 0,
  runner: 0,
};

type IdPrefix = keyof typeof counters;

export const createId = (prefix: IdPrefix): number => {
  counters[prefix] += 1;
  return counters[prefix];
};
