// Pricing data shapes — mirrors the Zod schema in src/content.config.ts plus
// the `id` that Astro's content collection adds at the entry level.

export interface PriceSet {
  monthlyEur: number;
  monthlyGbp: number;
  dailyEur?: number;
  dailyGbp?: number;
  yearlyEur?: number;
  yearlyGbp?: number;
}

export interface Plan {
  id: string;
  family: 'cloud' | 'dedicated';
  hardwareLine: string;
  name: string;
  cpus: number;
  storageGb: number;
  ramGb: number;
  prices: {
    production: PriceSet;
    development: PriceSet;
  };
  isMostPopular?: boolean;
  hasNearZeroDowntime?: boolean;
  order: number;
}

// Translatable labels passed from the parent .astro page into the React island.
// The React component can't call `useTranslations` directly (it would pull the
// i18n module into the client bundle), so the parent reads the strings and
// passes them through this typed interface.

export interface PricingTableLabels {
  name: string;
  cpus: string;
  storage: string;
  ram: string;
  buy: string;
  buyAria: string; // template like "Buy {plan}" — caller replaces {plan}
  monthly: string;
  daily: string;
  yearly: string;
  features: string;
  nearZeroDowntime: string;
  mostPopular: string;
  devSuffix: string;
}

export interface PricingTabsLabels {
  production: string;
  development: string;
  cloud: string;
  cloudSubtitle: string;
  dedicated: string;
  dedicatedSubtitle: string;
  unsureCopy: string;
  consultCta: string;
  consultHref: string;
  cloudHeading: string;
  cloudIntro: string;
  cloudNoteBefore: string;
  cloudNoteAfter: string;
  dedicatedHeading: string;
  dedicatedIntro: string;
  enterpriseTitle: string;
  standardTitle: string;
  combellTitle: string;
  awsTitle: string;
  table: PricingTableLabels;
}
