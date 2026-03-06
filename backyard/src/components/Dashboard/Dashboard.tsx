import "../../data/RunnersData";
import { Runners } from "../../data/RunnersData";

export default function Dashboard () {
  return (
    <>
      <Runners runners={runners}/>
    </>
  );
};