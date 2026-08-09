import { schema } from '@json-render/react';
import { z } from 'zod';

export const dealCatalog = schema.createCatalog({
  components: {
    DealCard: {
      props: z.object({
        title: z.string(),
        price: z.string(),
        discountRate: z.string().optional(),
        mallName: z.string(),
        imageUrl: z.string().optional(),
        url: z.string(),
      }),
    },
    DealList: {
      props: z.object({}),
    },
    Verdict: {
      props: z.object({
        dealCount: z.number(),
        lowest: z.number().nullable(),
        tier: z.enum(['S', 'A', 'B', 'C']).optional(),
        average: z.number().optional(),
      }),
    },
    PartialAnswer: {
      props: z.object({
        reason: z.any(),
        filteredCount: z.number(),
      }),
    },
    Distribution: {
      props: z.object({
        prices: z.array(z.number()),
      }),
    },
    PricePosition: {
      props: z.object({
        position: z.any(),
        title: z.string(),
      }),
    },
    PriceTrend: {
      props: z.object({
        points: z.array(z.any()),
        current: z.number(),
        confidence: z.string(),
      }),
    },
    AnswerText: {
      props: z.object({
        markdown: z.string(),
      }),
    },
    FollowUp: {
      props: z.object({
        suggestions: z.array(z.string()),
      }),
    },
    Review: {
      props: z.object({
        summary: z.any(),
        title: z.string(),
      }),
    },
    Failure: {
      props: z.object({
        message: z.string(),
      }),
    },
  },
  actions: {},
});

export type DealCardProps = {
  title: string;
  price: string;
  discountRate?: string;
  mallName: string;
  imageUrl?: string;
  url: string;
};
