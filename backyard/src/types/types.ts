
export type Runner = {
  id: number;
  name: string;
  lapTimes:number[];
};

export type RunnersProps = {
  runners: Runner[];
};
