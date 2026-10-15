// Production-safe: seeds only the vehicle make/model/variant catalog.
//   DATABASE_URL=… bun run src/scripts/seed-catalog.ts
import { closeConnection } from "../db";
import { seedVehicleCatalog } from "./catalog-data";

seedVehicleCatalog()
  .then(async () => { console.log("✅ vehicle catalog seeded"); await closeConnection(); })
  .catch(async (e) => { console.error(e); await closeConnection(); process.exit(1); });
