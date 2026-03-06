import { runners } from "../../data/runnersData";
import Runners from "../Runners/Runners";

export default function Dashboard () {
  return (
    <>
      <Runners runners={runners}/>
    </>
  );
};