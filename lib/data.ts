// Everything personal lives here. Edit this file to make the portfolio yours.
// Company names below are placeholders (Northwind / Contoso / Fabrikam) — swap in your own.

export const profile = {
  name: 'Saptrishi',
  initials: 'S',
  role: 'Data Engineer',
  location: 'Kolkata, India · Open to remote',
  email: 'hello@dreamymonk.xyz',
  altEmail: 'saptrishiwork@gmail.com',
  github: 'https://github.com/DreamyMonk',
  linkedin: 'https://www.linkedin.com/in/dreamymonk/',
  // Drop a PDF in /public and set this to '/resume.pdf' to show the Resume button.
  resume: '',
  tagline:
    'I design and run reliable data platforms — streaming pipelines, lakehouses and the models analysts actually trust.',
  funTagline: "I build pipelines that don't page anyone at 3am. Mostly.",
  bio: [
    "I'm a data engineer who likes boring infrastructure and exciting outcomes. For the last few years I've been turning messy event streams and legacy cron jobs into well-tested, observable pipelines.",
    'I care about data contracts, cost-aware warehouse design, and making on-call quiet. Outside work I tinker with DuckDB side projects and over-engineer my home weather station.',
  ],
  stats: [
    { value: '2B+', label: 'events processed / day' },
    { value: '120+', label: 'pipelines in production' },
    { value: '-40%', label: 'warehouse spend' },
    { value: '99.9%', label: 'SLA on critical jobs' },
  ],
};

export type Job = {
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experience: Job[] = [
  {
    company: 'Northwind Logistics',
    role: 'Senior Data Engineer',
    period: '2023 — Present',
    summary: 'Lead engineer on the real-time data platform serving pricing, ops and ML teams.',
    highlights: [
      'Built a Kafka → Flink → Iceberg streaming pipeline handling 2B events/day at p95 < 5s.',
      'Cut Snowflake spend 40% with incremental models, clustering and warehouse right-sizing.',
      'Introduced data contracts and dbt tests in CI, reducing data incidents by 70%.',
    ],
    stack: ['Kafka', 'Flink', 'Iceberg', 'Snowflake', 'dbt'],
  },
  {
    company: 'Contoso Retail',
    role: 'Data Engineer',
    period: '2021 — 2023',
    summary: 'Modernised batch ETL and built the first CDC pipelines for the analytics org.',
    highlights: [
      'Migrated 300+ legacy cron jobs to Airflow on Kubernetes with retries, SLAs and lineage.',
      'Shipped Postgres → warehouse CDC with Debezium, replacing nightly full dumps.',
      'Grew the dbt project to 200+ tested models used by 60 analysts.',
    ],
    stack: ['Airflow', 'Debezium', 'Postgres', 'BigQuery', 'dbt'],
  },
  {
    company: 'Fabrikam',
    role: 'Analytics Engineer',
    period: '2019 — 2021',
    summary: 'First data hire — stood up the warehouse and self-serve reporting.',
    highlights: [
      'Designed the initial BigQuery warehouse and dimensional models.',
      'Automated weekly reporting, saving the finance team ~20 hours a week.',
    ],
    stack: ['Python', 'BigQuery', 'Looker'],
  },
];

export type Project = {
  title: string;
  funTitle: string;
  description: string;
  impact: string;
  stack: string[];
  link?: string;
  accent: string;
};

export const projects: Project[] = [
  {
    title: 'Real-time clickstream pipeline',
    funTitle: 'The Firehose',
    description:
      'Exactly-once event ingestion from web and mobile into an Iceberg lakehouse, queryable in Trino within seconds.',
    impact: '2B events/day · p95 < 5s',
    stack: ['Kafka', 'Flink', 'Iceberg', 'Trino'],
    accent: '#c6ff00',
  },
  {
    title: 'Lakehouse migration',
    funTitle: 'Lakehouse Lift-off',
    description:
      'Moved a creaking on-prem warehouse to a medallion architecture on Delta Lake with zero downtime for dashboards.',
    impact: '-40% cost · 3× faster queries',
    stack: ['Databricks', 'Delta Lake', 'Spark', 'Terraform'],
    accent: '#ff3d81',
  },
  {
    title: 'Data quality & contracts',
    funTitle: 'Contract Cop',
    description:
      'Schema-registry checks in CI, freshness and volume monitors, and Slack alerts that route to the owning team.',
    impact: '-70% data incidents',
    stack: ['Great Expectations', 'dbt', 'GitHub Actions'],
    accent: '#00f0ff',
  },
  {
    title: 'Laptop-scale analytics stack',
    funTitle: 'Weather → Warehouse',
    description:
      'Open-source demo: an orchestrated weather ingestion pipeline with DuckDB, dbt and a static BI site.',
    impact: 'Runs end-to-end for $0',
    stack: ['Dagster', 'DuckDB', 'dbt', 'Python'],
    link: 'https://github.com/DreamyMonk',
    accent: '#8b5cf6',
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['Python', 'SQL', 'Bash'] },
  { group: 'Processing', items: ['Spark', 'Flink', 'dbt', 'Polars'] },
  { group: 'Streaming', items: ['Kafka', 'Debezium', 'Kinesis'] },
  { group: 'Orchestration', items: ['Airflow', 'Dagster', 'Prefect'] },
  { group: 'Storage', items: ['Snowflake', 'BigQuery', 'Databricks', 'Iceberg', 'Postgres'] },
  { group: 'Platform', items: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'GitHub Actions'] },
  {
    group: 'Azure',
    items: [
      'Data Factory',
      'Synapse Analytics',
      'Microsoft Fabric',
      'ADLS Gen2',
      'Event Hubs',
      'Azure Functions',
      'Cosmos DB',
    ],
  },
  {
    group: 'Azure DevOps',
    items: [
      'Azure Repos',
      'Azure Pipelines (YAML)',
      'Azure Boards',
      'Azure Artifacts',
      'Azure Test Plans',
      'Bicep',
      'ARM templates',
      'Key Vault',
      'Azure Monitor',
      'Application Insights',
      'AKS',
      'Container Registry',
    ],
  },
  {
    group: 'DataOps',
    items: ['CI/CD for data', 'Great Expectations', 'dbt tests', 'Data contracts', 'Data observability', 'OpenLineage', 'Git'],
  },
  { group: 'BI', items: ['Tableau', 'Power BI'] },
  { group: 'AI', items: ['RAG', 'Azure OpenAI', 'Azure AI Search'] },
];
