import {createWorkflowProviderFactory} from './provider.js'

/**
 * The `sanity.workflow` provider for the Blueprints API to register.
 * @beta This feature is subject to breaking changes.
 * @category Providers
 */
export const workflowProvider = createWorkflowProviderFactory()
