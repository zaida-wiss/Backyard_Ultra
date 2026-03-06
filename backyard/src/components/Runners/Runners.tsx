
import type { RunnersProps } from "../../types";
import {useAverageLapTime} from "../../hooks/useAverageLapTime";

const Runners: React.FC<RunnersProps> = ({runners}) => {
//räkna ut max antal varv
const maxLaps = Math.max(...runners.map(r=> r.lapTimes.length));


return (

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Namn</th>
        <th>Medeltid</th>
        {Array.from({ length: maxLaps }).map((_,i) => (
          <th key={i}>Varv{i+1}</th>
        ))}
      </tr>
    </thead>
  </table>

);

export default Runners;