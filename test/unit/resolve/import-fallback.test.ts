import {mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {findJiti, importNative} from '../../../src/resolve/import.js'
import {loadBlueprintFile} from '../../../src/resolve/index.js'

vi.mock(import('../../../src/resolve/import.js'), async (importOriginal) => {
  const original = await importOriginal()
  return {...original, importNative: vi.fn(), findJiti: vi.fn()}
})

const document = {blueprintVersion: '2024-10-01', resources: []}

function codeError(code: string, message = code) {
  return Object.assign(new Error(message), {code})
}

let dir: string
let path: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'sanity-blueprints-import-'))
  path = join(dir, 'sanity.blueprint.ts')
  writeFileSync(path, '')
})

afterEach(() => {
  rmSync(dir, {recursive: true, force: true})
  vi.resetAllMocks()
})

describe('loadBlueprintFile jiti fallback', () => {
  test.each([
    'ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX',
    'ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING',
    'ERR_UNKNOWN_FILE_EXTENSION',
    'ERR_MODULE_NOT_FOUND',
  ])('should retry with jiti after %s', async (code) => {
    const jiti = vi.fn(async () => () => document)
    vi.mocked(importNative).mockRejectedValue(codeError(code))
    vi.mocked(findJiti).mockResolvedValue(jiti)

    const {blueprint} = await loadBlueprintFile(path)

    expect(jiti).toHaveBeenCalledWith(path)
    expect(blueprint).toStrictEqual(document)
  })

  test('should not retry when the file throws while running', async () => {
    vi.mocked(importNative).mockRejectedValue(new Error('top-level throw'))

    await expect(loadBlueprintFile(path)).rejects.toThrow(/Unable to import .*: top-level throw\.$/)
    expect(findJiti).not.toHaveBeenCalled()
  })

  test('should suggest jiti when it is not installed', async () => {
    vi.mocked(importNative).mockRejectedValue(codeError('ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX', 'TypeScript enum is not supported'))
    vi.mocked(findJiti).mockResolvedValue(undefined)

    await expect(loadBlueprintFile(path)).rejects.toThrow(/TypeScript enum is not supported\. Install jiti to load it, or pass a loader\.$/)
  })

  test('should report the jiti error when jiti fails too', async () => {
    vi.mocked(importNative).mockRejectedValue(codeError('ERR_MODULE_NOT_FOUND'))
    vi.mocked(findJiti).mockResolvedValue(async () => {
      throw new Error('Cannot find module "missing-package"')
    })

    await expect(loadBlueprintFile(path)).rejects.toThrow(/Cannot find module "missing-package"/)
  })

  test('should use only the loader when one is passed', async () => {
    const loader = vi.fn(async () => {
      throw codeError('ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX')
    })

    await expect(loadBlueprintFile(path, {loader})).rejects.toThrow(/Unable to import/)
    expect(importNative).not.toHaveBeenCalled()
    expect(findJiti).not.toHaveBeenCalled()
  })
})
