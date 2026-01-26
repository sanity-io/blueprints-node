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

### JSDoc
Document all public exports:
```typescript
/**
 * Brief description
 * ```
 * Example usage
 * ```
 * @param name Description
 * @returns Description
 */
```

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
   - Define `BlueprintNewResourceConfig` (input type)
   - Define `BlueprintNewResourceResource extends BlueprintResource` (output type)

2. **Validation** (`src/validation/newresource.ts`):
   - Export `validateNewResource(config: unknown): BlueprintError[]`
   - Call `validateResource()` for base validation if applicable

3. **Definer** (`src/definers/newresource.ts`):
   - Export `defineNewResource(config: XConfig): XResource`
   - Set `type` field, call `runValidation()`

4. **Exports** (`src/index.ts`):
   - Add exports for all three files

5. **Tests**: Mirror structure in `test/unit/`

## CI/CD

PR checks run on Node 20.x, 22.x, 24.x across macOS, Ubuntu, Windows.
Full test suite must pass: `npm test` (includes typecheck, unit, integration, lint).
