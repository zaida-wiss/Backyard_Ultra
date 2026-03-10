import { runners } from "../../data/RunnersData";
import Runners from "../Runners/Runners";

export default function Dashboard () {
  return (
    <>
      <Runners runners={runners}/>
    </>
  );
};