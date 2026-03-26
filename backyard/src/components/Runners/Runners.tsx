import "./Runners.css";
import type { RunnersProps } from "../../types/types";

function calculateAverageLapTime(lapTimes: number[]): number {
  if (lapTimes.length === 0) return 0;
  const total = lapTimes.reduce((sum, time) => sum + time, 0);
  return total / lapTimes.length;
}

const Runners: React.FC<RunnersProps> = ({runners}) => {
  console.log("Runners:", runners);
//räkna ut max antal varv
const maxLaps = Math.max(...runners.map(r=> r.lapTimes.length));


return (
// Tabell
<div className="tabell-wrapper">
  <table className = "tabell">
    {/* Tabellhuvud */}
    <thead>
      {/* Bygg tabellens rubrikrad */}
      <tr>
        {/* Kolumnrubriker */}
        <th className ="sticky col-nr">Nr.</th>
        <th className="sticky col-namn">Namn</th>
        <th className="sticky col-medel">Medeltid</th>
        {/* Skapar en ny rubrikkolumn för varje varv */}
        {Array.from({ length: maxLaps }).map((_,i) => (
          <th key={i}>{i+1}</th>
        ))}
      </tr>
    </thead>
      <tbody>
        {/* För varje löpare i listan, skapa en ny tabellrad */}
        {runners.map((runner) => (
          <tr key={runner.id}>
            <td className="sticky col-nr">{runner.id}</td>
            <td className="sticky col-namn">{runner.name}</td>
            {/* Räkna ut varje löpares medelvärde på alla varvtider */}
            <td className="sticky col-medel">{calculateAverageLapTime(runner.lapTimes).toFixed(1)}</td>
            {/* Varje löpares varvtider */}
            {Array.from({ length: maxLaps }).map((_, i) => (
              <td key={i}>
                {runner.lapTimes[i] !== undefined ? runner.lapTimes[i] : "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
  </table>
</div>

);
}
export default Runners;