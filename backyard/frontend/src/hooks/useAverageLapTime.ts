import {useMemo} from "react";

export function useAverageLapTime(lapTimes: number[]):number {
  return useMemo(() => {
  if (lapTimes.length === 0) return 0;
  const total = lapTimes.reduce((sum, time) => sum + time, 0);
  return total / lapTimes.length;
}, [lapTimes]);
}