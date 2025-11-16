import {describe, expect, test} from 'vitest'
import {sdk} from '../../src/index.js'

describe('reference', () => {
  test('should transform a reference into the correct string', () => {
    const project = new sdk.sanity.project.Resource('my-project', {})

    const cors = new sdk.sanity.project.cors.Resource('my-cors', {
      origin: 'https://example.com',
      allowCredentials: false,
      project: sdk.sanity.project.reference(project).id,
    })

    const corsOutput = cors.build()

    expect(corsOutput.project).toEqual('$.resources.my-project.id')
  })

  test('should handle boolean references', () => {
    const project = new sdk.sanity.project.Resource('my-project', {})
    const cors = new sdk.sanity.project.cors.Resource('my-cors', {
      origin: 'https://example.com',
      allowCredentials: false,
      project: sdk.sanity.project.reference(project).id,
    })

    const allowCredentials = sdk.sanity.project.cors.reference(cors).allowCredentials

    expect(allowCredentials).toEqual('$.resources.my-cors.allowCredentials')
  })

  test('should handle nested references', () => {
    const func = new sdk.sanity.function.document.Resource('my-function', {
      src: './index.ts',
      event: {
        filter: '_type == "movie"',
        on: ['create'],
      },
    })

    const eventType = sdk.sanity.function.document.reference(func).event.on?.[0]

    expect(eventType).toEqual('$.resources.my-function.event.on[0]')
  })
})
