# No More Later

## Project
Expo / React Native productivity application.

## Development principles
- Preserve Android, iOS and web compatibility.
- Follow existing design components and appearance colours.
- Do not introduce new dependencies unless required.
- Keep Quest as the primary actionable unit.
- Journeys are optional groupings of Quests.
- Preserve existing Supabase RLS and ownership rules.

## Validation
The user runs validation locally.

Do not run lint, TypeScript checks, Expo Doctor, EAS builds or
tests unless explicitly requested.

After changes, state which checks the user should run.

Normal checks:
- npm run check

Native/dependency/config changes:
- npm run check:full

## Code changes
- Inspect the relevant existing implementation before editing.
- Prefer existing components/services/helpers over duplication.
- Avoid unrelated refactors.