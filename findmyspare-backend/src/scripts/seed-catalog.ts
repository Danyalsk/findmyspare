// Production-safe: seeds only reference data (industries, machine types,
// part categories, vehicle catalog). No users, products or orders.
//   DATABASE_URL=… bun run src/scripts/seed-catalog.ts
import { closeConnection } from "../db";
import { seedVehicleCatalog } from "./catalog-data";
import { seedTaxonomy } from "./taxonomy-data";

Promise.all([seedTaxonomy(), seedVehicleCatalog()])
  .then(async () => { console.log("✅ taxonomy + vehicle catalog seeded"); await closeConnection(); })
  .catch(async (e) => { console.error(e); await closeConnection(); process.exit(1); });
