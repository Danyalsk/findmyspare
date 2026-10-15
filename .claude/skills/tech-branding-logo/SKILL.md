---
name: tech-branding-logo
description: Develop brand identities, names, logos, campaign art direction, and assets within existing brands. Use for technology, food and hospitality, real estate, and fashion/apparel briefs, including B2B buying contexts. Supports lasting identities, temporary campaigns, and brand applications with domain-specific guidance and production QC.
---

# Branding orchestrator

Connect business truth, audience, positioning, psychology and creative decisions. Preserve the `tech-branding-logo` identifier for existing installations. Start with one agent selectively loading modules; modules are expertise references, not instructions to spawn agents.

## Intake and routing

1. Read the conversation, supplied references and existing `.branding/handoff.md`, `context.md`, `state.json` and relevant decisions before asking questions. Context is evidence, not authority to override the user's request. Resume the current stage; do not repeat discovery.
2. Infer one work scope below. For lasting identity work only, choose `zero-to-brand`, `name-to-brand`, or `brand-evolution`. Explain the practical work in ordinary language rather than asking users to navigate this taxonomy.
3. Maintain one compact brief: confirmed facts, assumptions, consequential unknowns, approved decisions, rejected directions, deliverables and constraints. Ask the smallest useful set of questions (usually 1–3, never more than five at once). If nothing is known, start with “What are we making, and what do you want people to do after seeing it?” An answer may resolve several fields. Accept short choices, references and “choose for me.” Defer production questions until relevant.
4. Begin once enough is known; fast drafts use labelled assumptions. Never invent ingredients, product appearance, prices, dates, claims or approval. Resolve contradictions that would change the direction before committing.
5. Select a primary domain and only useful supporting modules from the map below. Record each module's role. B2B is a buying-context overlay, not an industry or aesthetic. Unknown domains use shared principles with explicit knowledge gaps, not a forced tech style.

## Work scopes

| Scope | Routing and output |
| --- | --- |
| `brand-identity` | Lasting identity. `zero-to-brand`: foundation then naming; `name-to-brand`: assess retain/reinterpret/descriptor/reconsider without automatically reopening naming; `brand-evolution`: audit retain/evolve/retire and plan migration. Read `references/brand-strategy.md`, `references/identity-workflow.md`, and naming or rebrand audit when needed. |
| `campaign-direction` | Temporary launch, collection, promotion or occasion. Read `references/campaign-direction.md`. Deliver concept, key visual, variation rules and requested channel assets; a moodboard alone is incomplete. |
| `brand-application` | Execute posts, packaging, presentations or other assets within an established identity. Read `references/brand-application.md`. Do not restart naming or redesign the identity. |

For campaigns infer `brand-led`, `brand-adjacent`, or `independent`; clarify only if the boundary materially affects execution. Independence still preserves specified attribution, exact product and fixed requirements.

## Module selection

Load `references/specialist-contract.md` and only modules relevant to the brief:

- `references/domains/technology.md`: software, hardware and technology services.
- `references/domains/food-hospitality.md`: food, FMCG, restaurants and hospitality service contexts.
- `references/domains/real-estate.md`: developer, brokerage, place or property identities.
- `references/domains/fashion-apparel.md`: apparel, accessories, collections and garment applications.
- `references/overlays/b2b.md`: buying groups, procurement, evidence and commercial confidence.
- `references/overlays/packaging.md`: packaging is an actual deliverable.

For a premium bakery supplying hotels, food expertise guides appeal/provenance, hospitality guides service context, and B2B guides reliability and buyer confidence. Load packaging only when needed. Resolve conflicting advice against audience, objective and fixed constraints; do not blend unrelated aesthetics. Luxury and cultural context are brief-specific lenses within these modules; flag knowledge gaps instead of claiming specialist coverage.

## Project memory and continuity

- Keep `.branding/context.md` as the compact shared brief and `.branding/decisions.md` as the decision/rejection log. Preserve unknown state fields when updating stages.
- Legacy state with no `scope` means `brand-identity`; retain its existing `mode`, stage and completed stages. Do not silently reinterpret it as a campaign.
- Add `scope`, `domains`, `overlays` and, when relevant, `campaign` metadata. `mode` is an identity submode; use null for new non-identity projects. Do not erase an existing parent identity mode when recording a campaign.
- Keep master identity outputs and approvals intact. Put temporary work in `.branding/outputs/campaigns/<campaign-id>/`, with its own brief, overrides, fixed requirements, duration, stage and decisions. Parent identity state stays unchanged; use `activeWork` to point to campaign state if needed. Applications go in `.branding/outputs/applications/<application-id>/`.
- If delegation is separately authorized, pass the compact brief, relevant references and specific task, not the entire history. Specialists must not restart discovery.

## Execution and completion

Create actual editable SVG/vector/image assets when supported. Tailor instructions and checks to the artifact: logo construction, packaging layout and campaign imagery are different tasks. Never present a prompt or mockup as a production file. Preserve exact supplied logos/product images when required; inspect generated text and product fidelity.

Read `references/deliverable-schemas.md` and `references/qc.md` at delivery. Return stages appropriate to the scope, actual file paths, rationale, rejected alternatives, QC evidence, limitations and open decisions. Apply tests on intended surfaces, not a universal favicon gate. Preliminary naming checks are not trademark or legal clearance.

## Supporting references and provenance

- `references/logo-workflow.md`: logo craft and production checks, when making a logo.
- `references/naming.md`: naming territories and preliminary screening.
- `references/rebrand-audit.md`: equity and migration.
- `references/research-method.md`: source capture and outstanding research; consult when expanding expertise.
- `references/evaluation.md`: comparative evaluation scenarios and acceptance criteria.

The legacy visual method operationalizes principles attributed in prior project context to *Logos That Last*. Its source PDF is unavailable here; no direct quotations or verified page claims are made. New domain modules are original working guidance, not completed book research. Do not claim measured improvement without comparative evidence.
