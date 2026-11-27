import {describe, expect, test} from 'vitest'

import {DatasetHandle} from '../../../src/build/dataset.js'

describe('DatasetHandle', () => {
  const dataset = new DatasetHandle('production')

  test('datasetName references the dataset name', () => {
    expect(dataset.datasetName).toBe('$.resources.production.datasetName')
  })

  test('resourceId references the qualified dataset resource ID', () => {
    expect(dataset.resourceId).toBe('$.resources.production.resourceId')
  })
})
