
import type { RunnersProps } from "../../types";
import {useAverageLapTime} from "../../hooks/useAverageLapTime";

const Runners: React.FC<RunnersProps> = ({runners}) => {
//räkna ut max antal varv
const maxLaps = Math.max(...runners.map(r=> r.lapTimes.length));


return (

  <table>
    <thead>
      {/* Bygg tabellens rubrikrad */}
      <tr>
        {/* Kolumnrubriker */}
        <th>Nr.</th>
        <th>Namn</th>
        <th>Medeltid</th>
        {/* Skapar en ny rubrikkolumn för varje varv */}
        {Array.from({ length: maxLaps }).map((_,i) => (
          <th key={i}>{i+1}</th>
        ))}
      </tr>
    </thead>
            <tbody>
        {runners.map((runner) => (
          <tr key={runner.id}>
            <td>{runner.id}</td>
            <td>{runner.name}</td>
            <td>{useAverageLapTime(runner.lapTimes).toFixed(1)}</td>

            {Array.from({ length: maxLaps }).map((_, i) => (
              <td key={i}>
                {runner.lapTimes[i] !== undefined ? runner.lapTimes[i] : "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
  </table>

);
}
export default Runners;