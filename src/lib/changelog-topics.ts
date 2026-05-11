export const CHANGELOG_TOPICS = [
  'API',
  'Autoscaling',
  'Cluster',
  'Control panel',
  'Hypernode Deploy',
  'Insights',
  'MageReport',
  'Platform',
] as const;

export type ChangelogTopic = (typeof CHANGELOG_TOPICS)[number];
