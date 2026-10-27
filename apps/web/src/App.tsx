// apps/web/src/App.tsx — the list comes from the server
import type { Building, Entrance } from "@office/shared";
import { useEffect, useState } from "react";
import { EntranceForm } from "./EntranceForm";

const API = "http://localhost:3000";

function EntranceItem({ entrance }: { entrance: Entrance }) {
  return (
    <li>
      {entrance.address} ({entrance.buildingName}) — {entrance.floors} floors
      {entrance.hasElevator ? ", elevator" : ""}
    </li>
  );
}

export default function App() {
  const [entrances, setEntrances] = useState<Entrance[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    // both lists at once: the form needs the buildings, the list the entrances
    Promise.all([
      fetch(`${API}/api/entrances`).then((res) => res.json()),
      fetch(`${API}/api/buildings`).then((res) => res.json()),
    ])
      .then(([entranceList, buildingList]: [Entrance[], Building[]]) => {
        if (!ignore) {
          setEntrances(entranceList);
          setBuildings(buildingList);
        }
      })
      .catch((err: Error) => {
        if (!ignore) {
          setError(err.message);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main>
      <h1>Entrances</h1>
      <EntranceForm
        api={API}
        buildings={buildings}
        onCreated={(entrance) => setEntrances([...entrances, entrance])}
      />
      {error && <p role="alert">Could not load the entrances: {error}</p>}
      <ul>
        {entrances.map((entrance) => (
          <EntranceItem entrance={entrance} key={entrance.id} />
        ))}
      </ul>
    </main>
  );
}
