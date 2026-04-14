import {afterEach, describe, expect, test, vi} from 'vitest'
import * as datasets from '../../../src/definers/datasets.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineDataset', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should accept a valid configuration and set the type', () => {
    const datasetResource = datasets.defineDataset({
      name: 'dataset-name',
      description: 'valid dataset',
      aclMode: 'public',
    })

    expect(datasetResource.type).toStrictEqual('sanity.project.dataset')
    expect(datasetResource.datasetName).toStrictEqual('dataset-name')
    expect(datasetResource.description).toStrictEqual('valid dataset')
  })

  test('should accept a valid configuration with a lifecycle', () => {
    const datasetResource = datasets.defineDataset({
      name: 'dataset-name',
      aclMode: 'public',

      lifecycle: {
        deletionPolicy: 'allow',
      },
    })

    expect(datasetResource.lifecycle?.deletionPolicy).toStrictEqual('allow')
  })

  test('should accept a valid configuration with an attach lifecycle', () => {
    const datasetResource = datasets.defineDataset({
      name: 'dataset-name',
      aclMode: 'public',

      lifecycle: {
        ownershipAction: {
          type: 'attach',
          projectId: 'test-project',
          id: 'production',
        },
      },
    })

    if (datasetResource.lifecycle?.ownershipAction?.type !== 'attach') {
      throw new Error('expected ownershipAction with type attach')
    }
    expect(datasetResource.lifecycle?.ownershipAction?.projectId).toStrictEqual('test-project')
  })

  test('should throw if validateDataset returns an error', () => {
    const spy = vi.spyOn(index, 'validateDataset').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(
        datasets.defineDataset({
          name: 'dataset-name',
          aclMode: 'public',
        }),
      ),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })
})
