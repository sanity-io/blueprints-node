import {afterEach, describe, expect, test, vi} from 'vitest'
import * as studios from '../../../src/definers/studios.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineStudio', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateStudio returns an error', () => {
    const spy = vi.spyOn(index, 'validateStudio').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(
        studios.defineStudio({
          name: 'studio-name',
          src: 'studios/my-studio',
          project: 'abcd1234',
          slug: 'my-studio',
        }),
      ),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
      project: 'abcd1234',
      slug: 'my-studio',
      title: 'My Studio',
      autoUpdates: {
        enabled: false,
      },
    })

    expect(studioResource.type).toStrictEqual('sanity.studio')
    expect(studioResource.title).toStrictEqual('My Studio')
    expect(studioResource.autoUpdates.enabled).toStrictEqual(false)
  })

  test('should default the title to the name', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
      project: 'abcd1234',
      slug: 'my-studio',
      autoUpdates: {
        enabled: true,
      },
    })

    expect(studioResource.type).toStrictEqual('sanity.studio')
    expect(studioResource.title).toStrictEqual('studio-name')
  })

  test('should default the slug to the name', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
      project: 'abcd1234',
    })

    expect(studioResource.slug).toStrictEqual('studio-name')
  })

  test('should default the autoUpdates to enabled and omit the version', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
      project: 'abcd1234',
      slug: 'my-studio',
    })

    expect(studioResource.autoUpdates).toStrictEqual({enabled: true})
  })

  test('should omit the version when autoUpdates is provided without one', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
      project: 'abcd1234',
      slug: 'my-studio',
      autoUpdates: {enabled: false},
    })

    expect(studioResource.autoUpdates).toStrictEqual({enabled: false})
  })

  test('should keep an explicit autoUpdates version', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
      project: 'abcd1234',
      slug: 'my-studio',
      autoUpdates: {version: '^4.0.0'},
    })

    expect(studioResource.autoUpdates).toStrictEqual({enabled: true, version: '^4.0.0'})
  })

  test('should produce a valid resource from a minimal config', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
      project: 'abcd1234',
    })

    expect(index.validateStudio(studioResource)).toStrictEqual([])
  })

  test('should not accept a name that is not a valid hostname label as a slug', () => {
    const studioResource = studios.defineStudio({
      name: 'My Studio',
      src: 'studios/my-studio',
      project: 'abcd1234',
    })

    expect(studioResource.slug).toStrictEqual('My Studio')
    expect(index.validateStudio(studioResource)).toContainEqual({
      type: 'invalid_format',
      message: 'Studio slug must match pattern: ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$',
    })
  })

  test('should accept a valid configuration with a lifecycle', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
      project: 'abcd1234',
      slug: 'my-studio',
      autoUpdates: {
        enabled: true,
      },

      lifecycle: {
        deletionPolicy: 'allow',

        ownershipAction: {
          type: 'attach',
          projectId: 'a1b2c3',
          id: 'abc123',
        },
      },
    })

    expect(studioResource.lifecycle?.deletionPolicy).toStrictEqual('allow')
  })
})
