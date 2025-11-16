import {DocumentFunctionResource, reference as docFuncRef} from './sanity/function/document'
import {ProjectResource, reference as projectRef} from './sanity/project'
import {CorsResource, reference as corsRef} from './sanity/project/cors'

export const sdk = {
  sanity: {
    function: {
      document: {
        reference: docFuncRef,
        Resource: DocumentFunctionResource,
      },
    },
    project: {
      reference: projectRef,
      Resource: ProjectResource,
      cors: {
        reference: corsRef,
        Resource: CorsResource,
      },
    },
  },
}
