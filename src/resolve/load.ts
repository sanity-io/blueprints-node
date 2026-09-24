import {existsSync, readFileSync, statSync} from 'node:fs'
import {dirname, extname, join, resolve} from 'node:path'
import {cwd} from 'node:process'
import type {Blueprint, BlueprintModule} from '../index.js'
import {byName} from './by-name.js'
import {canRetryWithJiti, findJiti, importNative} from './import.js'
import {readStackConfigFile, resolveStackConfig, stackIdsFromEnv} from './stack-config.js'
import type {BlueprintInfo, BlueprintLoader, LoadBlueprintFileOptions, LoadedBlueprintFile, ReadBlueprintOptions} from './types.js'

const EXTENSIONS = ['.json', '.js', '.mjs', '.ts']
const BASE_NAMES = EXTENSIONS.map((ext) => `blueprint${ext}`)

/**
 * The file names {@link findBlueprintFile} looks for, in order
 * @category Resolve
 */
export const BLUEPRINT_FILE_NAMES = [...BASE_NAMES, ...BASE_NAMES.map((name) => `sanity.${name}`)]

/**
 * Find a blueprint file
 *
 * Returns a file path as is. Searches a directory, then its parents, for {@link BLUEPRINT_FILE_NAMES}.
 *
 * @param path A blueprint file or directory. Defaults to the current working directory.
 * @returns The absolute path of the file, or `undefined` when none is found
 * @category Resolve
 */
export function findBlueprintFile(path: string = cwd()): string | undefined {
  let dir = resolve(path)
  if (!existsSync(dir)) return undefined
  if (statSync(dir).isFile()) return dir

  while (true) {
    for (const name of BLUEPRINT_FILE_NAMES) {
      const candidate = join(dir, name)
      if (existsSync(candidate)) return candidate
    }
    const parent = dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

/**
 * Load a blueprint file
 *
 * Parses a JSON file. Imports a JS or TS file and calls its default export.
 * TypeScript that Node cannot run, such as an enum, is loaded with jiti when it is installed.
 * Imported modules are cached, so a later call in the same process does not see changes to the file. Pass a `loader` that skips the cache to re-read it.
 *
 * @param path The blueprint file
 * @throws When the file cannot be loaded or does not produce a blueprint object
 * @category Resolve
 */
export async function loadBlueprintFile(path: string, options: LoadBlueprintFileOptions = {}): Promise<LoadedBlueprintFile> {
  const extension = extname(path)

  if (extension === '.json') {
    let blueprint: unknown
    try {
      blueprint = JSON.parse(readFileSync(path, 'utf8'))
    } catch (error) {
      throw new Error(`Unable to parse ${path}: ${errorText(error)}`, {cause: error})
    }
    return {blueprint: asBlueprint(blueprint, path)}
  }

  if (!EXTENSIONS.includes(extension)) {
    throw new Error(`Unsupported blueprint file extension "${extension}" for ${path}. Expected one of: ${EXTENSIONS.join(', ')}`)
  }

  const defaultExport = await importDefault(path, options.loader)
  if (typeof defaultExport !== 'function') {
    throw new Error(`${path} must export a default function. Wrap the blueprint in defineBlueprint().`)
  }

  const module = defaultExport as BlueprintModule
  let blueprint: unknown
  try {
    blueprint = module()
  } catch (error) {
    throw new Error(`Error executing the default export of ${path}: ${errorText(error)}`, {cause: error})
  }

  return {blueprint: asBlueprint(blueprint, path), module}
}

/**
 * Read a local blueprint and the ids of the Stack it deploys to
 *
 * Ids come from `overrides`, the environment, `defineBlueprint`, then `.sanity/blueprint.config.json`.
 * Resources are not validated. No network access.
 *
 * @example
 * ```ts
 * import {readBlueprint} from '@sanity/blueprints/resolve'
 *
 * const {resources, resourcesByName, stackId, sources} = await readBlueprint()
 * resources.map((resource) => resource.name)
 * resourcesByName['production-dataset']?.type // 'sanity.project.dataset'
 * sources.stackId // 'config'
 * ```
 * @throws When no blueprint file is found, it cannot be loaded, or `resources` is not an array
 * @category Resolve
 */
export async function readBlueprint(options: ReadBlueprintOptions = {}): Promise<BlueprintInfo> {
  const path = findBlueprintFile(options.path)
  if (!path) {
    const searched = resolve(options.path ?? cwd())
    throw new Error(`No blueprint file found in ${searched} or its parent directories. Expected one of: ${BLUEPRINT_FILE_NAMES.join(', ')}`)
  }

  const {blueprint, module} = await loadBlueprintFile(path, {loader: options.loader})

  const resources = blueprint.resources ?? []
  if (!Array.isArray(resources)) throw new Error(`Invalid blueprint in ${path}: \`resources\` must be an array`)

  const file = readStackConfigFile(dirname(path))
  const config = resolveStackConfig({
    overrides: options.overrides,
    env: options.env === undefined ? undefined : options.env && stackIdsFromEnv(options.env),
    module,
    config: file,
  })

  return {path, blueprint, module, resources, resourcesByName: byName(resources), ...config, configPath: file?.configPath}
}

async function importDefault(path: string, loader?: BlueprintLoader): Promise<unknown> {
  let error: unknown
  try {
    return await (loader ?? importNative)(path)
  } catch (caught) {
    error = caught
  }

  if (!loader && canRetryWithJiti(error)) {
    const jiti = await findJiti(path)
    if (!jiti) throw new Error(`Unable to import ${path}: ${errorText(error)} Install jiti to load it, or pass a loader.`, {cause: error})
    try {
      return await jiti(path)
    } catch (caught) {
      error = caught
    }
  }

  throw new Error(`Unable to import ${path}: ${errorText(error)}`, {cause: error})
}

function errorText(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return message.endsWith('.') ? message : `${message}.`
}

function asBlueprint(value: unknown, path: string): Blueprint {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} did not produce a blueprint object`)
  }
  return value as Blueprint
}
