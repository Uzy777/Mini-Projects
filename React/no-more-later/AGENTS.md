# No More Later - Codex Instructions

## Working style

- Inspect the existing relevant implementation before making changes.
- Follow existing project patterns where practical.
- Keep changes focused on the requested task.
- Avoid unrelated refactors.
- Prefer existing components, helpers and services over duplication.

## Project safety

- Preserve Android, iOS and web compatibility unless the task explicitly
  targets one platform.
- Do not alter existing behaviour outside the requested feature unless
  required for the implementation.
- Do not change database schemas, RLS policies or migrations unless the
  task requires it.
- Do not add new dependencies unless they provide a clear benefit for the
  requested task.
- Never expose secrets or service-role credentials to client code.

## Validation

The user normally performs project validation locally.

Do not run:
- lint
- TypeScript checks
- Expo Doctor
- automated tests
- EAS builds

unless the current task explicitly asks for them.

After making changes, tell the user which validation command they should run.

Normal validation:
`npm run check`

Native/config/dependency validation:
`npm run check:full`

## Task instructions

Instructions in the current user request may override these defaults when
necessary for that task.