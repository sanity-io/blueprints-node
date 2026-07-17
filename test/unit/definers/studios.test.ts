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
          autoUpdates: {
            enabled: true,
          },
        }),
      ),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
      autoUpdates: {
        enabled: true,
      },
    })

    expect(studioResource.type).toStrictEqual('sanity.studio')
  })

  test('should accept a valid configuration with a lifecycle', () => {
    const studioResource = studios.defineStudio({
      name: 'studio-name',
      src: 'studios/my-studio',
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
