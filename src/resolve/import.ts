import {createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import type {BlueprintLoader} from './types.js'

type CreateJiti = (id: string) => {import(id: string, options: {default: true}): Promise<unknown>}

// Node throws these while loading a file, before running any of it, so a retry with jiti runs nothing twice
const RETRY_WITH_JITI = new Set([
  'ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX',
  'ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING',
  'ERR_UNKNOWN_FILE_EXTENSION',
  'ERR_MODULE_NOT_FOUND',
])

/**
 * Import a file natively and return its default export
 * @internal
 */
export async function importNative(path: string): Promise<unknown> {
  const imported: {default?: unknown} = await import(pathToFileURL(path).href)
  return imported.default
}

/**
 * Whether jiti may be able to import a file that the native import could not
 * @internal
 */
export function canRetryWithJiti(error: unknown): boolean {
  return error instanceof Error && 'code' in error && RETRY_WITH_JITI.has(String(error.code))
}

/**
 * A jiti loader, when jiti resolves from the blueprint file or from this package
 * @internal
 */
export async function findJiti(path: string): Promise<BlueprintLoader | undefined> {
  for (const from of [path, import.meta.url]) {
    let resolved: string
    try {
      resolved = createRequire(from).resolve('jiti')
    } catch {
      continue
    }
    const {createJiti}: {createJiti?: CreateJiti} = await import(pathToFileURL(resolved).href)
    if (typeof createJiti !== 'function') continue
    return (file) => createJiti(file).import(pathToFileURL(file).href, {default: true})
  }
  return undefined
}
