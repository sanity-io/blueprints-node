import {type ClientConfig, createClient} from '@sanity/client'
import {clientConfigFromResource, ENGINE_API_VERSION, type WorkflowClient} from '@sanity/workflow-engine'

import type {WorkflowsResource} from './resource.js'

type BlueprintsEnvironment = 'production' | 'staging' | 'test'

const API_HOSTS: Record<BlueprintsEnvironment, string> = {
  production: 'https://api.sanity.io',
  staging: 'https://api.sanity.work',
  test: 'http://api.sanity.local',
}

function blueprintApiHost(environment: BlueprintsEnvironment): string {
  return API_HOSTS[environment]
}

export function blueprintApiHostFromEnv(environment: string | undefined): string {
  if (environment === undefined || environment === 'test') return blueprintApiHost('test')
  if (environment === 'production' || environment === 'staging') return blueprintApiHost(environment)
  throw new Error(`Unknown Blueprints environment: ${JSON.stringify(environment)}`)
}

export interface WorkflowProviderClientContext {
  environment: BlueprintsEnvironment
  token: string
}

export function blueprintsClientConfig(resource: WorkflowsResource, context: WorkflowProviderClientContext): ClientConfig {
  return {
    ...clientConfigFromResource(resource.deployment.workflowResource),
    apiHost: blueprintApiHost(context.environment),
    apiVersion: ENGINE_API_VERSION,
    requestTagPrefix: 'sanity.workflows.blueprints',
    token: context.token,
    useCdn: false,
  }
}

export function createWorkflowClient(resource: WorkflowsResource, context: WorkflowProviderClientContext): WorkflowClient {
  return createClient(blueprintsClientConfig(resource, context))
}

export type WorkflowClientFactory = (resource: WorkflowsResource, context: WorkflowProviderClientContext) => WorkflowClient
