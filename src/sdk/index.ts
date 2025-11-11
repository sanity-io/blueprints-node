import {reference as docFuncRef, DocumentFunctionResource} from './sanity/function/document'
import {reference as projectRef, ProjectResource} from './sanity/project'
import {reference as corsRef, CorsResource} from './sanity/project/cors'

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
