import {afterEach, describe, expect, test, vi} from 'vitest'
import * as mediaLibraryConfig from '../../../src/definers/installation-config.js'
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
          name: 'media-library',
          root: './media-library',
          fields: [{name: 'brand', title: 'Brand', src: './src/fields/brand.tsx'}],
        }),
      ),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type and appType', () => {
    const resource = mediaLibraryConfig.defineMediaLibraryConfig({
      name: 'media-library',
      root: './media-library',
      fields: [{name: 'brand', title: 'Brand', src: './src/fields/brand.tsx'}],
    })

    expect(resource.type).toStrictEqual('sanity.installation.config')
    expect(resource.appType).toStrictEqual('media-library')
    expect(resource.root).toStrictEqual('./media-library')
    expect(resource.fields).toStrictEqual([{name: 'brand', title: 'Brand', src: './src/fields/brand.tsx'}])
  })

  test('should keep the provided name', () => {
    const resource = mediaLibraryConfig.defineMediaLibraryConfig({
      name: 'my-media-library',
      root: './media-library',
      fields: [{name: 'brand', title: 'Brand', src: './src/fields/brand.tsx'}],
    })

    expect(resource.name).toStrictEqual('my-media-library')
  })

  test('should produce a valid resource from a minimal config', () => {
    const resource = mediaLibraryConfig.defineMediaLibraryConfig({
      name: 'media-library',
      root: './media-library',
      fields: [{name: 'brand', title: 'Brand', src: './src/fields/brand.tsx'}],
    })

    expect(index.validateMediaLibraryConfig(resource)).toStrictEqual([])
  })
})
