import {describe, expect, test} from 'vitest'
import {defineDataset} from '../../src/index.js'

describe('defineDataset', () => {
  test('should accept a valid configuration and set the type', () => {
    const datasetResource = defineDataset({
      name: 'dataset-name',
      aclMode: 'public',
    })

    expect(datasetResource.type).toStrictEqual('sanity.project.dataset')
    expect(datasetResource.datasetName).toStrictEqual('dataset-name')
  })

  test('should throw if invalid aclMode is provided', () => {
    expect(() =>
      defineDataset({
        name: 'dataset-name',
        // @ts-expect-error Invalid value for testing
        aclMode: 'invalid',
      }),
    ).toThrow(/aclMode must be one of/)
  })

  test('should throw if invalid project data type is provided', () => {
    expect(() =>
      defineDataset({
        name: 'dataset-name',
        // @ts-expect-error Invalid value for testing
        project: 1,
      }),
    ).toThrow(/project must be a string/)
  })
})
