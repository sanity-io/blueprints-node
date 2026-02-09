# AGENTS.md - Coding Agent Guidelines for @sanity/blueprints

## Project Overview

TypeScript library providing helper methods and type definitions for Sanity Blueprints.
ESM-only package. Node.js >=20 required.

## Commands

### Build
```bash
npm run build        # Clean dist/ and compile TypeScript
npm run typecheck    # Type check without emitting
```

### Lint & Format
```bash
npm run lint         # Check with Biome (linting + formatting)
npm run lint:write   # Auto-fix lint/format issues
```

### Test
```bash
npm test                        # Full suite: typecheck + unit + integration + lint
npm run test:unit               # Unit tests only (with typecheck)
npm run test:integration        # Integration tests (in test/integration/)
npm run coverage                # Unit tests with coverage report

# Single test file:
npx vitest run test/unit/validation/cors.test.ts

# Single test by name pattern:
npx vitest run -t "should return an error if config is falsey"

# Watch mode:
npx vitest test/unit/validation/cors.test.ts
```

## Project Structure

```
src/
  index.ts              # Barrel exports (all public API)
  types/                # Type definitions (interfaces, type aliases)
  validation/           # Validation functions (return BlueprintError[])
  definers/             # Builder functions (defineX pattern)
  utils/                # Internal utilities
test/
  unit/                 # Unit tests (mirrors src/ structure)
  integration/          # Integration tests (separate package)
```

## Code Style

### Formatting (Biome)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: None (omit)
- **Trailing commas**: Always
- **Bracket spacing**: None `{foo}` not `{ foo }`
- **Line width**: 140 chars

### Imports
- Use `.js` extension for local imports: `from '../index.js'`
- Use `type` keyword for type-only imports: `import type {Foo} from './foo.js'`
- Biome auto-organizes imports on save

### TypeScript
- **Very strict mode**: All `strict*` flags enabled plus `noImplicit*`, `noUnused*`
- No `@ts-ignore` or `as any` without exhausting proper type solutions
- Prefer `satisfies` over type assertions for shape validation
- Use `verbatimModuleSyntax` (explicit `type` imports required)
- Target: ES2023

### Naming Conventions
- **Functions/variables**: camelCase (`validateResource`, `corsResource`)
- **Types/interfaces**: PascalCase with `Blueprint` prefix (`BlueprintResource`, `BlueprintError`)
- **Type aliases**: PascalCase (`WebhookTrigger`, `BlueprintResourceDeletionPolicy`)
- **Test files**: `*.test.ts` matching source structure

### Functions

#### Validation Functions
Return `BlueprintError[]` (never throw). Collect all errors:
```typescript
export function validateFoo(config: unknown): BlueprintError[] {
  if (!config) return [{type: 'invalid_value', message: 'config must be provided'}]
  if (typeof config !== 'object') return [{type: 'invalid_type', message: 'config must be an object'}]

  const errors: BlueprintError[] = []
  // ... validate fields, push errors
  return errors
}
```

Error types: `invalid_value`, `invalid_type`, `missing_parameter`, `invalid_format`

#### Definer Functions
Use `defineX` pattern. Always validate:
```typescript
export function defineX(config: XConfig): XResource {
  const resource: XResource = {...config, type: 'sanity.project.x'}
  runValidation(() => validateX(resource))
  return resource
}
```

### JSDoc / TypeDoc

This project generates documentation with TypeDoc. All public exports must have thorough JSDoc. When creating or modifying definers and types, always update their JSDoc to match these conventions.

#### Definer functions

```typescript
/**
 * Brief one-line summary
 *
 * @remarks
 * Extended details (only when the summary needs elaboration).
 *
 * @example
 * ```ts
 * defineX({
 *   name: 'my-resource',
 *   // minimal required fields
 * })
 * ```
 *
 * @example Advanced usage
 * ```ts
 * defineX({
 *   name: 'my-resource',
 *   // all fields, cross-resource references, etc.
 * })
 * ```
 * @param parameters Description
 * @public
 * @category Definers
 * @expandType BlueprintXConfig
 * @returns Description
 */
```

Rules:
- The first `@example` must be **untitled**. It should show minimal required fields including `name`.
- Additional `@example` blocks must have a **title**. Use these for advanced usage, cross-resource references (`$.resources.*`), or kitchen-sink all-options examples.
- Use `@expandType TypeName` to inline the parameter type in the docs (requires a named Config type).
- Use `@remarks` only when the summary needs a longer explanation (e.g. `defineScheduleFunction`).

#### Config types (definer parameter types)

```typescript
/**
 * Brief description
 * @see https://link-to-docs
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 */
export type BlueprintXConfig = Omit<BlueprintXResource, 'type'> & {
  /**
   * Field description
   * @defaultValue fallback value or description
   */
  optionalField?: string
}
```

Rules:
- Use `@interface` on type aliases that use `Omit` or intersections so TypeDoc flattens them into a readable property list.
- Use `@expand` on small types/interfaces (e.g. `RobotTokenMembership`) so they are inlined where referenced.
- Use `@defaultValue` (not `@default`) on optional properties that have defaults set by the definer. This renders distinctly in the TypeDoc HTML output.
- Match visibility tags (`@public`, `@beta`, `@alpha`, `@hidden`, `@internal`) between the Config type and its definer.

### Error Handling
- Validation functions return error arrays, never throw
- `runValidation()` converts errors to thrown Error with joined messages
- Definers call `runValidation()` to fail fast on invalid config

## Tests

### Structure
Use Vitest with `describe`/`test` (not `it`):
```typescript
import {describe, expect, test} from 'vitest'
import {validateFoo} from '../../../src/index.js'

describe('validateFoo', () => {
  test('should return an error if config is falsey', () => {
    const errors = validateFoo(undefined)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'config must be provided',
    })
  })
})
```

### Mocking
```typescript
import {afterEach, vi} from 'vitest'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const original = await importOriginal()
  return {...original, validateX: vi.fn(() => [])}
})

afterEach(() => vi.resetAllMocks())
```

### Assertions
- `expect(x).toStrictEqual(y)` for exact equality
- `expect(errors).toContainEqual({...})` for error checking
- `expect(() => fn()).toThrow(/pattern/)` for thrown errors

## Adding New Resource Types

1. **Types** (`src/types/newresource.ts`):
   - Define `BlueprintNewResourceResource extends BlueprintResource` (output type)
   - Define `BlueprintNewResourceConfig` (input type, usually `Omit<Resource, 'type' | ...>`)
   - Add `@interface` to the Config type so TypeDoc flattens it
   - Add `@defaultValue` to any optional properties with defaults
   - Add `@expand` to small supporting types/interfaces

2. **Validation** (`src/validation/newresource.ts`):
   - Export `validateNewResource(config: unknown): BlueprintError[]`
   - Call `validateResource()` for base validation if applicable

3. **Definer** (`src/definers/newresource.ts`):
   - Export `defineNewResource(config: XConfig): XResource`
   - Set `type` field, call `runValidation()`
   - Add JSDoc with untitled `@example` (minimal usage) and titled `@example` (advanced/all-options)
   - Add `@expandType BlueprintNewResourceConfig` to inline the parameter type in docs
   - Match visibility tags (`@public`/`@beta`/`@alpha`) with the Config type

4. **Exports** (`src/index.ts`):
   - Add exports for all three files

5. **Tests**: Mirror structure in `test/unit/`

6. **Verify docs**: Run `npx typedoc` and check the generated HTML for correct rendering

## CI/CD

PR checks run on Node 20.x, 22.x, 24.x across macOS, Ubuntu, Windows.
Full test suite must pass: `npm test` (includes typecheck, unit, integration, lint).
