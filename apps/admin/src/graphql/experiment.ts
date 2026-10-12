import { gql } from '@apollo/client';

// 실험·관찰 등록부 — 원본은 crawling-server src/experiment/experiment-registry.ts
export const QueryExperiments = gql`
  query QueryExperiments {
    experiments {
      id
      kind
      status
      title
      question
      design
      toggle
      primaryMetric
      decisionRule
      power
      readout
      startedAt
      checkAt
      endedAt
      overdue
      code
      results {
        date
        summary
        decision
      }
    }
  }
`;
