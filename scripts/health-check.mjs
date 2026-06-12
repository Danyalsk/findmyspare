#!/usr/bin/env node

/**
 * FindMySpare — Full-Stack Health Check
 * Tests: DB connection, Backend API, Socket.IO, Frontend
 */

const BE_URL = "http://localhost:8000";
const FE_URL = "http://localhost:3000";
const SOCKET_URL = "http://localhost:8000";

const PASS = "\x1b[32m✓ PASS\x1b[0m";
const FAIL = "\x1b[31m✗ FAIL\x1b[0m";
const WARN = "\x1b[33m⚠ WARN\x1b[0m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

const results = [];

function log(status, label, detail = "") {
  const line = `  ${status}  ${label}${detail ? DIM + " — " + detail + RESET : ""}`;
  console.log(line);
  results.push({ status: status.includes("PASS") ? "pass" : status.includes("WARN") ? "warn" : "fail", label });
}

async function fetchJSON(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const data = await res.json();
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchStatus(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

console.log(`\n${BOLD}╔══════════════════════════════════════════════════════╗${RESET}`);
console.log(`${BOLD}║      FindMySpare — Full-Stack Health Check           ║${RESET}`);
console.log(`${BOLD}╚══════════════════════════════════════════════════════╝${RESET}\n`);

// ─── 1. Backend Reachability ────────────────────────────
console.log(`${BOLD}1. Backend Server (${BE_URL})${RESET}`);
const root = await fetchJSON(`${BE_URL}/`);
if (root.ok && root.data?.status === "running") {
  log(PASS, "Backend is running", `v${root.data.version} — ${root.data.status}`);
} else if (root.ok) {
  log(WARN, "Backend responded but unexpected payload", JSON.stringify(root.data).slice(0, 100));
} else {
  log(FAIL, "Backend unreachable", root.error);
}

// ─── 2. Database via /health ────────────────────────────
console.log(`\n${BOLD}2. Database (via /health)${RESET}`);
const health = await fetchJSON(`${BE_URL}/health`);
if (health.ok && health.data?.database?.status === "connected") {
  log(PASS, "PostgreSQL connected", `uptime ${Math.round(health.data.uptime)}s`);
} else if (health.ok && health.data?.database?.status === "error") {
  log(FAIL, "PostgreSQL connection error", health.data.database.error || "unknown");
} else if (health.ok) {
  log(WARN, "Health endpoint responded but no DB status", JSON.stringify(health.data).slice(0, 120));
} else {
  log(FAIL, "Health endpoint unreachable", health.error);
}

// ─── 3. Swagger ─────────────────────────────────────────
console.log(`\n${BOLD}3. Swagger API Docs${RESET}`);
const swagger = await fetchStatus(`${BE_URL}/swagger`);
if (swagger.ok && swagger.status === 200) {
  log(PASS, "Swagger UI accessible", `${BE_URL}/swagger`);
} else if (swagger.ok) {
  log(WARN, "Swagger responded with status", `${swagger.status}`);
} else {
  log(FAIL, "Swagger unreachable", swagger.error);
}

// ─── 4. Key API Routes ──────────────────────────────────
console.log(`\n${BOLD}4. Key API Routes${RESET}`);
const routes = [
  { path: "/products", label: "Products API" },
  { path: "/banners", label: "Banners API" },
  { path: "/auth/login", label: "Auth API", method: "POST" },
];
for (const route of routes) {
  const r = await fetchJSON(`${BE_URL}${route.path}`);
  if (r.ok && (r.status === 200 || r.status === 401)) {
    log(PASS, route.label, `HTTP ${r.status}`);
  } else if (r.ok) {
    log(WARN, route.label, `HTTP ${r.status}`);
  } else {
    log(FAIL, route.label, r.error);
  }
}

// ─── 5. Socket.IO Handshake ─────────────────────────────
console.log(`\n${BOLD}5. Socket.IO${RESET}`);
const sioRes = await fetchJSON(`${SOCKET_URL}/socket.io/?EIO=4&transport=polling`);
if (sioRes.ok) {
  log(PASS, "Socket.IO polling endpoint reachable", `HTTP ${sioRes.status}`);
} else {
  // Socket.IO returns non-JSON on first poll; try raw fetch
  const rawRes = await fetchStatus(`${SOCKET_URL}/socket.io/?EIO=4&transport=polling`);
  if (rawRes.ok) {
    log(PASS, "Socket.IO polling endpoint reachable", `HTTP ${rawRes.status}`);
  } else {
    log(FAIL, "Socket.IO unreachable", rawRes.error);
  }
}

// ─── 6. Frontend ────────────────────────────────────────
console.log(`\n${BOLD}6. Frontend (${FE_URL})${RESET}`);
const fe = await fetchStatus(FE_URL);
if (fe.ok && fe.status === 200) {
  log(PASS, "Next.js frontend is running", `HTTP ${fe.status}`);
} else if (fe.ok) {
  log(WARN, "Frontend responded with status", `${fe.status}`);
} else {
  log(FAIL, "Frontend unreachable", fe.error);
}

// ─── Summary ────────────────────────────────────────────
const passed = results.filter(r => r.status === "pass").length;
const warned = results.filter(r => r.status === "warn").length;
const failed = results.filter(r => r.status === "fail").length;
const total = results.length;

console.log(`\n${BOLD}═══════════════════════════════════════════════════════${RESET}`);
if (failed === 0) {
  console.log(`  ${BOLD}\x1b[32m🎉 All ${total} checks passed!${RESET}`);
} else {
  console.log(`  ${BOLD}Results: ${passed}/${total} passed, ${warned} warnings, ${failed} failed${RESET}`);
}
console.log(`${BOLD}═══════════════════════════════════════════════════════${RESET}\n`);

process.exit(failed > 0 ? 1 : 0);
