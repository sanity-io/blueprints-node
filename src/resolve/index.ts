/**
 * `@sanity/blueprints/resolve`
 *
 * A Blueprint declares resources. A Stack is its deployed counterpart.
 * {@link readBlueprint} reads local blueprint.
 * {@link readStack} reads remote stack.
 *
 * This entry point imports Node built-ins, so it is separate from `@sanity/blueprints`.
 * @module
 */

/**
 * @categoryDescription Resolve
 * These functions read a blueprint from disk, resolve the Stack it deploys to, and read that Stack from the Blueprints API.
 */
export * from './load.js'
export * from './stack.js'
export * from './stack-config.js'
export * from './types.js'
