import { defineCollection, type SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { CHANGELOG_TOPICS } from '@/lib/changelog-topics';

// Homepage
const homepageSectionSchema = ({ image }: SchemaContext) =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('feature-section'),
      title: z.string(),
      subtitle: z.string().optional(),
      image: image(),
      imageAlt: z.string(),
      imageSide: z.enum(['left', 'right']).default('right'),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
      order: z.number(),
    }),
    z.object({
      type: z.literal('feature-grid'),
      title: z.string(),
      subtitle: z.string().optional(),
      cards: z.array(
        z.object({
          icon: image(),
          iconAlt: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      ),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
      order: z.number(),
    }),
    z.object({
      type: z.literal('logo-strip'),
      logos: z.array(
        z.object({
          image: image(),
          alt: z.string(),
        }),
      ),
      order: z.number(),
    }),
    z.object({
      type: z.literal('testimonials'),
      title: z.string(),
      testimonials: z.array(
        z.object({
          logo: image(),
          logoAlt: z.string(),
          quote: z.string(),
          avatar: image(),
          avatarAlt: z.string(),
          name: z.string(),
          role: z.string(),
        }),
      ),
      order: z.number(),
    }),
  ]);

const homepageEn = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/en/homepage' }),
  schema: homepageSectionSchema,
});

const homepageNl = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/nl/homepage' }),
  schema: homepageSectionSchema,
});

// Pricing
const pricingPlanSchema = z.object({
  family: z.enum(['cloud', 'dedicated']),
  hardwareLine: z.enum(['combell-openstack', 'aws', 'jackal-enterprise', 'jackal']),
  name: z.string(),
  cpus: z.number(),
  storageGb: z.number(),
  ramGb: z.number(),
  prices: z.object({
    production: z.object({
      monthlyEur: z.number(),
      monthlyGbp: z.number(),
      dailyEur: z.number().optional(),
      dailyGbp: z.number().optional(),
      yearlyEur: z.number().optional(),
      yearlyGbp: z.number().optional(),
    }),
    development: z.object({
      monthlyEur: z.number(),
      monthlyGbp: z.number(),
      dailyEur: z.number().optional(),
      dailyGbp: z.number().optional(),
      yearlyEur: z.number().optional(),
      yearlyGbp: z.number().optional(),
    }),
  }),
  isMostPopular: z.boolean().optional(),
  hasNearZeroDowntime: z.boolean().optional(),
  order: z.number(),
});

const pricingPlansEn = defineCollection({
  loader: file('./src/content/en/pricing/plans.yaml'),
  schema: pricingPlanSchema,
});

// Changelog
const changelogEntrySchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  category: z.enum(['Release', 'Update']),
  topic: z.enum(CHANGELOG_TOPICS),
  sourceUrl: z.string(),
  publishedAt: z.coerce.date(),
});

const changelogEn = defineCollection({
  loader: file('./strapi/seed.json'),
  schema: changelogEntrySchema,
});

export const collections = {
  'homepage-en': homepageEn,
  'homepage-nl': homepageNl,
  'pricing-plans-en': pricingPlansEn,
  'changelog-en': changelogEn,
};
