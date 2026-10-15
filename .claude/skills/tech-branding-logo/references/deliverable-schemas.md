# Deliverable schemas

Use JSON or YAML with these top-level objects. Add files only when they exist.

```yaml
project: {name: string, scope: brand-identity|campaign-direction|brand-application, mode: zero-to-brand|name-to-brand|brand-evolution|null, date: YYYY-MM-DD}
foundation: {audience: [], problem: string, promise: string, proof: [], role: string, personality: [], tensions: [], anti_positioning: [], territories: []}
naming: {status: not_applicable|in_progress|recommended|screening_note, candidates: [], recommendation: string}
nouns: {generated: [], approved: [], rejected: []}
concepts: [{id: string, nouns: [], silhouette: string, geometry: string, negative_space: string, story: string, app_icon: string, risks: [], score: number}]
directions: [{id: string, concept_ids: [], rationale: string, logo_assets: [], visual_dna: {colors: [], type: [], icons: [], patterns: [], motion: []}, tests: []}]
qc: {scores: {}, blockers: [], open_risks: [], decision: pass|iterate|hold}
delivery: {files: [], usage_rules: [], touchpoints: [], migration: [], open_decisions: []}
```

For `brand-identity`, the minimum final file set (adapt exploration to the documented scope): strategy/positioning, approved noun list, concept board or catalog, three directions or documented selection rationale, final logo variants, palette/type/tokens, visual-DNA rules, application examples, QC report, and a usage/migration guide as applicable.

## Scope-specific additions

Preserve existing manifest fields for identity work. For campaigns/applications omit irrelevant naming, nouns, concepts and directions; do not fabricate these artifacts to fill the schema.

```yaml
routing: {primary_domain: string, supporting_domains: [], overlays: [], reasons: {}}
brief: {confirmed: {}, assumptions: [], unresolved: [], approved_decisions: [], rejected_directions: []}
campaign:
  id: string
  parent_brand: string
  freedom: brand-led|brand-adjacent|independent
  objective: string
  audience: string
  product_or_offer: string
  occasion: string
  duration: string
  channels: []
  fixed_requirements: []
  permitted_overrides: []
  applies_to: []
  concept: string
  key_visual: string
  variation_rules: []
  assets: [{path: string, channel: string, dimensions: string, status: draft|verified}]
application: {id: string, parent_brand: string, source_guidelines: [], assets: [], production_constraints: []}
```

Campaign minimum: brief/boundaries, concept and art direction, actual key visual, requested channel assets, variation rules, QC and manifest. Application minimum: source identity references, requested assets, applicable usage/production rules, QC and manifest. Include only the matching scope object. Missing deliverables are blockers or explicitly deferred items, never fictional file paths. Non-identity manifests use null mode unless an existing parent identity mode is retained as context. Temporary overrides never update master tokens automatically.
