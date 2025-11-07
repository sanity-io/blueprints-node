import {describe, expect, test} from 'vitest'
import {DocumentFunctionResource, reference as docFuncRef} from '../../src/sdk/sanity/function/document'
import {ProjectResource, reference as projectRef} from '../../src/sdk/sanity/project'
import {CorsResource, reference as corsRef} from '../../src/sdk/sanity/project/cors'

describe('reference', () => {
  test('should transform a reference into the correct string', () => {
    const project = new ProjectResource('my-project', {})

    const cors = new CorsResource('my-cors', {
      origin: 'https://example.com',
      allowCredentials: false,
      project: projectRef(project).id,
    })

    const corsOutput = cors.build()

    expect(corsOutput.project).toEqual('$.resources.my-project.id')
  })

  test('should handle boolean references', () => {
    const project = new ProjectResource('my-project', {})
    const cors = new CorsResource('my-cors', {
      origin: 'https://example.com',
      allowCredentials: false,
      project: projectRef(project).id,
    })

    const allowCredentials = corsRef(cors).allowCredentials

    expect(allowCredentials).toEqual('$.resources.my-cors.allowCredentials')
  })

  test('should handle nested references', () => {
    const func = new DocumentFunctionResource('my-function', {
      src: './index.ts',
      event: {
        filter: '_type == "movie"',
        on: ['create'],
      },
    })

    const eventType = docFuncRef(func).event.on?.[0]

    expect(eventType).toEqual('$.resources.my-function.event.on[0]')
  })
})
