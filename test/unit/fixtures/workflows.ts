export const workflowDeployment = {
  name: 'production',
  expectedMinReaderModel: 4,
  tag: 'production',
  workflowResource: {type: 'dataset' as const, id: 'projectId.dataset'},
  definitions: [
    {
      name: 'article-review',
      title: 'Article review',
      initialStage: 'draft',
      stages: [{name: 'draft'}],
    },
  ],
}
