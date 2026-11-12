import { Link } from "react-router-dom";
import { ACTIVE_JOB } from "../data/job";
import { loadG1State } from "../lib/gates";

export function JobsListPage() {
  const g1 = loadG1State();
  return (
    <>
      <h1 className="headline">Jobs</h1>
      <table className="data">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Gate</th>
            <th>G1</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Link to={`/jobs/${ACTIVE_JOB.id}`}>{ACTIVE_JOB.id}</Link>
            </td>
            <td>{ACTIVE_JOB.title}</td>
            <td>{ACTIVE_JOB.nextGate}</td>
            <td>{g1}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
