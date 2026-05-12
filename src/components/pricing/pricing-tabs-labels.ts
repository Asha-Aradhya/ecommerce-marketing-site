import { useTranslations, type Lang } from '@/i18n/text';
import type { PricingTabsLabels } from '@/types/pricing';

// Hardware-line section titles. These are brand/product names that stay
// the same in every locale, so they are not part of the i18n dictionary.
const COMBELL_TITLE = 'Combell OpenStack';
const AWS_TITLE = 'Amazon Web Services';

export function buildPricingTabsLabels(lang: Lang): PricingTabsLabels {
  const t = useTranslations(lang);
  return {
    production:        t('pricing.tabs.production'),
    development:       t('pricing.tabs.development'),
    cloud:             t('pricing.tabs.cloud'),
    cloudSubtitle:     t('pricing.tabs.cloudSubtitle'),
    dedicated:         t('pricing.tabs.dedicated'),
    dedicatedSubtitle: t('pricing.tabs.dedicatedSubtitle'),
    unsureCopy:        t('pricing.tabs.unsureCopy'),
    consultCta:        t('pricing.tabs.consultCta'),
    consultHref:       t('nav.comingSoon.href'),
    cloudHeading:      t('pricing.tabs.cloudHeading'),
    cloudIntro:        t('pricing.tabs.cloudIntro'),
    cloudNoteBefore:   t('pricing.tabs.cloudNoteBefore'),
    cloudNoteAfter:    t('pricing.tabs.cloudNoteAfter'),
    dedicatedHeading:  t('pricing.tabs.dedicatedHeading'),
    dedicatedIntro:    t('pricing.tabs.dedicatedIntro'),
    enterpriseTitle:   t('pricing.tabs.enterpriseTitle'),
    standardTitle:     t('pricing.tabs.standardTitle'),
    combellTitle:      COMBELL_TITLE,
    awsTitle:          AWS_TITLE,
    table: {
      name:             t('pricing.table.name'),
      cpus:             t('pricing.table.cpus'),
      storage:          t('pricing.table.storage'),
      ram:              t('pricing.table.ram'),
      buy:              t('pricing.table.buy'),
      buyAria:          t('pricing.table.buyAria'),
      monthly:          t('pricing.table.monthly'),
      daily:            t('pricing.table.daily'),
      yearly:           t('pricing.table.yearly'),
      features:         t('pricing.table.features'),
      nearZeroDowntime: t('pricing.table.nearZeroDowntime'),
      mostPopular:      t('pricing.table.mostPopular'),
      devSuffix:        t('pricing.table.devSuffix'),
    },
  };
}
