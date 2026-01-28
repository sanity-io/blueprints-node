import {afterEach, describe, expect, test, vi} from 'vitest'
import * as datasets from '../../../src/definers/datasets.js'
import * as index from '../../../src/index.js'

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
      aclMode: 'public',
    })

    expect(datasetResource.type).toStrictEqual('sanity.project.dataset')
    expect(datasetResource.datasetName).toStrictEqual('dataset-name')
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

    expect(datasetResource.lifecycle?.ownershipAction?.projectId).toStrictEqual('test-project')
  })

  test('should throw if validateDataset returns an error', () => {
    const spy = vi.spyOn(index, 'validateDataset').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      datasets.defineDataset({
        name: 'dataset-name',
        aclMode: 'public',
      }),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })
})
