<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.


<claude-mem-context>
# Memory Context

# [FindMySpare] recent context, 2026-05-01 11:11pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (13,318t read) | 640,807t work | 98% savings

### Apr 30, 2026
S19 User confirmed "go" — implementation of all audit-identified gaps now starting in FindMySpare backend (Apr 30 at 2:34 AM)
S20 User confirmed "go" — full implementation plan queued as task list in FindMySpare backend (Apr 30 at 2:50 AM)
S18 Full backend/frontend audit + missing endpoints, env setup for Render/Vercel deployment, replace nhost storage, deliver "what else needs to be done" roadmap (Apr 30 at 2:50 AM)
S32 Observer agent monitoring FindMySpare backend build session — all 12 tasks completed including deployment config, socket port fix, and pagination bug discovery (Apr 30 at 2:55 AM)
S33 Dev environment audit — user wants to focus on making the app work locally before production; full FE/BE gap analysis performed (Apr 30 at 5:44 PM)
198 5:59p 🔵 Stub pages use ComingSoon component — intentionally disabled features
199 " 🔵 Login page has built-in demo account quick-login buttons for dev testing
200 " 🔵 Search page fully wired to real productsApi.list() — no mock data
201 " 🔵 Homepage fetches banners + 12 newest products in parallel via Promise.allSettled
202 6:00p 🔵 bannersApi client exists and calls GET /banners
203 " 🔵 Frontend API client is complete with auto-refresh, 401 retry, and all domain modules exported
204 " 🔵 Demo accounts defined — 3 supplier test users must be seeded in DB
205 " 🔵 Cart, payment, and success pages are all ComingSoon stubs — e-commerce flow intentionally disabled
206 " 🔵 Auth store uses localStorage with fms_ prefix keys, handles role-based routing including admin
207 " 🔵 FE verification status routing matches backend enum exactly
S38 FindMySpare full-stack chat + seed — plan approved, execution starting now (Apr 30 at 6:01 PM)
208 6:09p ⚖️ Nhost DB credentials provided — scoped to lead-gen + chat MVP
209 " 🔵 Subagent launched to audit FE chat/messages infrastructure before building
210 " 🔵 Chat infrastructure audit complete — zero existing chat types, no messages in nav, ChatBubble component exists
S39 FindMySpare chat + seed implementation — plan approved, about to spawn parallel execution tasks (Apr 30 at 6:10 PM)
S35 FindMySpare full-stack chat implementation: DB schema, seed script, Socket.IO events, BE routes, FE pages, navigation (Apr 30 at 6:10 PM)
S37 FindMySpare full-stack chat + seed implementation — plan written, execution starting (Apr 30 at 6:10 PM)
214 6:13p 🟣 FindMySpare backend .env created with Nhost PostgreSQL credentials
215 " 🟣 Messages table schema added to Drizzle ORM
218 6:14p 🔵 Nhost DB reachable via drizzle-kit but direct postgres client fails DNS
217 6:18p 🔵 drizzle.config.ts confirmed: ssl=require, schema at src/db/schema/index.ts
219 6:21p 🔵 Phase 1 complete: messages schema on disk, no scripts dir yet, DB DNS issue persists
220 " 🟣 Seed script created: 6 users + 9 products with realistic Indian auto parts data
221 6:23p 🟣 db:seed script added to package.json
222 " ✅ Task 14 (seed script) completed — Phase 2 done
223 " ✅ Task 15 started — BE messages routes + socket events
224 " 🟣 BE messages routes created with SQL CTE for conversations list
303 11:20p 🔵 io.ts and index.ts current state confirmed before Phase 3 edits
305 " 🟣 Socket.IO message broadcast functions added to io.ts
306 " 🔴 io.ts edit did not persist — still 84 lines without message broadcasts
307 11:25p 🟣 messageRoutes imported and Messages swagger tag added to index.ts
308 " 🟣 messageRoutes mounted in index.ts — BE chat API fully wired
309 11:26p 🔵 FE state confirmed before Phase 4: ComingSoon stub and no messages.ts API file
310 11:31p 🟣 FE messages API client created and index.ts body fix applied
311 11:35p 🟣 Full Real-Time Chat UI — FE Implementation Plan Delivered
312 11:36p 🟣 Message and Conversation Types Added to types.ts
313 11:41p 🟣 Messages API Client Created with Correct fetchApi Pattern
314 " ✅ messages.ts Written Again — Identical Content, Duplicate Write
318 " 🟣 Conversations List Page Implemented
326 " 🟣 Chat Thread Page Implemented with Optimistic UI
327 " 🟣 Socket.ts Created — Singleton Socket.IO Client with useSocket Hook
328 " 🟣 TabBar and DesktopNav Updated with Messages Navigation
315 " 🟣 Messages API Exported from Central API Index
329 11:48p 🟣 Messages Tab Added to TabBar and DesktopNav for Both Roles
333 11:52p 🟣 "Message Supplier" Button Added to Product Detail Page
334 11:53p 🟣 "Message Supplier" Button Added to Product Detail Page
S75 Convert FindMySpare to lead-gen marketplace with full real-time Socket.IO chat (Apr 30 at 11:54 PM)
### May 1, 2026
477 10:46p 🔵 Swiggy Builder API — Ideation Session
479 10:49p ⚖️ Swiggy Builder API — Rejected First Idea, Seeking Unconventional Use Case
485 10:54p ⚖️ Swiggy Builder API — Goal Reframed as Portfolio/Hiring Signal
493 10:57p 🔵 Swiggy Builder API — Testing/Sandbox Availability Queried
494 11:01p ⚖️ Swiggy Builder API MVP — Design & Product Direction Locked
495 " 🔵 MVP Build Planned Inside Existing "FindMySpare" Repo
496 11:05p ⚖️ Vision: Build Delivery Platform Bigger Than Swiggy
498 11:10p ⚖️ Product Scope Pivot: Low Decision-Friction UX Priority

Access 641k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>