import {afterEach, describe, expect, test, vi} from 'vitest'
import * as mediaLibraryConfig from '../../../src/definers/media-library-config.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineMediaLibraryConfig', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateMediaLibraryConfig returns an error', () => {
    const spy = vi.spyOn(index, 'validateMediaLibraryConfig').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(
        mediaLibraryConfig.defineMediaLibraryConfig({
          src: './media-library.config.ts',
        }),
      ),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type and appType', () => {
    const resource = mediaLibraryConfig.defineMediaLibraryConfig({
      src: './media-library.config.ts',
    })

    expect(resource.type).toStrictEqual('sanity.installation.config')
    expect(resource.appType).toStrictEqual('media-library')
    expect(resource.src).toStrictEqual('./media-library.config.ts')
  })

  test('should default the name to media-library', () => {
    const resource = mediaLibraryConfig.defineMediaLibraryConfig({
      src: './media-library.config.ts',
    })

    expect(resource.name).toStrictEqual('media-library')
  })

  test('should keep an explicit name', () => {
    const resource = mediaLibraryConfig.defineMediaLibraryConfig({
      name: 'my-media-library',
      src: './media-library.config.ts',
    })

    expect(resource.name).toStrictEqual('my-media-library')
  })

  test('should produce a valid resource from a minimal config', () => {
    const resource = mediaLibraryConfig.defineMediaLibraryConfig({
      src: './media-library.config.ts',
    })

    expect(index.validateMediaLibraryConfig(resource)).toStrictEqual([])
  })
})
