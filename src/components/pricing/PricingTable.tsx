import { useState } from 'react';
import Toggle from '@/components/ui/Toggle';
import type { Plan, PricingTableLabels } from '@/types/pricing';

interface Props {
  title: string;
  plans: Plan[];
  mode: 'production' | 'development';
  labels: PricingTableLabels;
}

type Currency = 'eur' | 'gbp';
type Period = 'monthly' | 'daily' | 'yearly';

const CLOUD_FEATURES = [
  'Free migration service',
  'Pre-installed Magento 2',
  'Magento optimized NGINX and PHP',
  'Intuitive control panel',
  '24/7 server monitoring & autorecovery',
  'Email, chat & phone support',
  'Free SLA Basic',
  '400 Brancher minutes',
  'Elastic search build-in support',
  'PWA compatible',
  'Dedicated IP',
  'Extensive backup services',
  'Extensive security measures',
  'PHPFPM',
  "Automatic Let's Encrypt configuration",
  'Analysis tools Blackfire & New Relic',
  'Rabbit MQ',
  'Varnish Cache',
  'PCI Compliancy Service',
  'PHP 5.6 - PHP 8.4',
];

const DEDICATED_FEATURES = [
  'Dedicated hardware',
  'Free migration service',
  'Pre-installed Magento 2',
  'Magento optimized NGINX and PHP',
  'Intuitive control panel',
  '24/7 server monitoring & autorecovery',
  'Email, chat & phone support',
  'Free SLA Basic',
  'PWA compatible',
  'Dedicated IP',
  'Extensive backup services',
  'Extensive security measures',
  'PHPFPM',
  "Automatic Let's Encrypt configuration",
  'Analysis tools Blackfire & New Relic',
  'Rabbit MQ',
  'Varnish Cache',
  'PCI Compliancy Service',
  'PHP 5.6 - PHP 8.4',
];

interface FeaturesPopoverProps {
  planName: string;
  features: string[];
  featuresLabel: string;
}

function FeaturesPopover({ planName, features, featuresLabel }: FeaturesPopoverProps) {
  return (
    <div className="relative group inline-block">
      <button
        type="button"
        className="text-navy-dark hover:text-orange underline text-xs"
      >
        {featuresLabel}
      </button>
      <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-20 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-72 text-left">
        <h4 className="font-bold text-navy-dark mb-3 text-sm">{planName}</h4>
        <ul className="space-y-1.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-navy-dark">
              <span className="text-emerald-500 shrink-0">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NearZeroDowntimeBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
      {label}
    </span>
  );
}

function MostPopularBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-orange text-white text-[10px] uppercase tracking-wide px-2 py-0.5 rounded">
      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
      {label}
    </span>
  );
}

function BuyButton({ planName, ariaTemplate }: { planName: string; ariaTemplate: string }) {
  return (
    <a
      href="/en/coming-soon/"
      aria-label={ariaTemplate.replace('{plan}', planName)}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-navy-dark text-navy-dark hover:bg-orange hover:border-orange hover:text-white transition-colors"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </a>
  );
}

export default function PricingTable({ title, plans, mode, labels }: Props) {
  const family = plans[0]?.family ?? 'cloud';
  const isCloud = family === 'cloud';
  const features = isCloud ? CLOUD_FEATURES : DEDICATED_FEATURES;
  const altPeriod: Period = isCloud ? 'daily' : 'yearly';
  const altPeriodLabel = isCloud ? labels.daily : labels.yearly;

  const [currency, setCurrency] = useState<Currency>('eur');
  const [period, setPeriod] = useState<Period>('monthly');

  const getPrice = (plan: Plan): number | undefined => {
    const priceSet = plan.prices[mode];
    if (period === 'monthly') {
      return currency === 'eur' ? priceSet.monthlyEur : priceSet.monthlyGbp;
    }
    if (period === 'daily') {
      return currency === 'eur' ? priceSet.dailyEur : priceSet.dailyGbp;
    }
    if (period === 'yearly') {
      return currency === 'eur' ? priceSet.yearlyEur : priceSet.yearlyGbp;
    }
    return undefined;
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '—';
    const symbol = currency === 'eur' ? '€' : '£';
    return `${symbol} ${price.toLocaleString('en-US')}`;
  };

  const periodLabel = period === 'monthly' ? labels.monthly : period === 'daily' ? labels.daily : labels.yearly;
  const planDisplayName = (plan: Plan) =>
    `${plan.name}${mode === 'development' ? labels.devSuffix : ''}`;

  const radioId = (name: string, value: string) => `${title}-${name}-${value}`;

  const yearlyDiscountBadge = !isCloud ? (
    <span className="text-[10px] bg-red-500 text-white px-1 py-0.5 rounded ml-1">-15%</span>
  ) : null;

  return (
    <div className="my-8">
      <h3 className="text-lg md:text-xl font-bold text-navy-dark mb-4">{title}</h3>

      {/* Mobile: toggle switches above the cards */}
      <div className="lg:hidden flex flex-wrap items-center justify-between gap-4 mb-4">
        <Toggle
          leftLabel={labels.monthly}
          rightLabel={
            <span className="flex items-center gap-1">
              {altPeriodLabel}
              {yearlyDiscountBadge}
            </span>
          }
          isLeft={period === 'monthly'}
          onToggle={() => setPeriod(period === 'monthly' ? altPeriod : 'monthly')}
        />
        <Toggle
          leftLabel="€ EUR"
          rightLabel="£ GBP"
          isLeft={currency === 'eur'}
          onToggle={() => setCurrency(currency === 'eur' ? 'gbp' : 'eur')}
        />
      </div>

      {/* Desktop: table with toggles in header */}
      <div className="hidden lg:block border border-gray-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 align-top">
              <th className="text-left px-4 py-4 font-medium text-navy-dark">{labels.name}</th>
              <th className="text-left px-4 py-4 font-medium text-navy-dark">{labels.cpus}</th>
              <th className="text-left px-4 py-4 font-medium text-navy-dark">{labels.storage}</th>
              <th className="text-left px-4 py-4 font-medium text-navy-dark">{labels.ram}</th>
              <th className="text-left px-4 py-4 font-medium text-navy-dark">
                <div className="flex gap-6">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={radioId('currency', 'eur')}
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <input
                        id={radioId('currency', 'eur')}
                        type="radio"
                        name={radioId('currency', 'group')}
                        checked={currency === 'eur'}
                        onChange={() => setCurrency('eur')}
                        className="accent-orange"
                      />
                      <span>€ EUR</span>
                    </label>
                    <label
                      htmlFor={radioId('currency', 'gbp')}
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <input
                        id={radioId('currency', 'gbp')}
                        type="radio"
                        name={radioId('currency', 'group')}
                        checked={currency === 'gbp'}
                        onChange={() => setCurrency('gbp')}
                        className="accent-orange"
                      />
                      <span>£ GBP</span>
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={radioId('period', 'monthly')}
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <input
                        id={radioId('period', 'monthly')}
                        type="radio"
                        name={radioId('period', 'group')}
                        checked={period === 'monthly'}
                        onChange={() => setPeriod('monthly')}
                        className="accent-orange"
                      />
                      <span>{labels.monthly}</span>
                    </label>
                    <label
                      htmlFor={radioId('period', 'alt')}
                      className="flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <input
                        id={radioId('period', 'alt')}
                        type="radio"
                        name={radioId('period', 'group')}
                        checked={period === altPeriod}
                        onChange={() => setPeriod(altPeriod)}
                        className="accent-orange"
                      />
                      <span className="flex items-center">
                        {altPeriodLabel}
                        {yearlyDiscountBadge}
                      </span>
                    </label>
                  </div>
                </div>
              </th>
              <th className="text-right px-4 py-4 font-medium text-navy-dark">{labels.buy}</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-4 align-top">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-navy-dark text-base">{planDisplayName(plan)}</span>
                    {plan.isMostPopular && <MostPopularBadge label={labels.mostPopular} />}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <FeaturesPopover
                      planName={planDisplayName(plan)}
                      features={features}
                      featuresLabel={labels.features}
                    />
                    {plan.hasNearZeroDowntime && (
                      <NearZeroDowntimeBadge label={labels.nearZeroDowntime} />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-navy-dark align-top">
                  <strong>{plan.cpus}</strong>
                </td>
                <td className="px-4 py-4 text-navy-dark align-top">
                  <strong>{plan.storageGb}</strong> GB
                </td>
                <td className="px-4 py-4 text-navy-dark align-top">
                  <strong>{plan.ramGb}</strong> GB
                </td>
                <td className="px-4 py-4 font-bold text-navy-dark align-top">
                  {formatPrice(getPrice(plan))}
                </td>
                <td className="px-4 py-4 text-right align-top">
                  <BuyButton planName={plan.name} ariaTemplate={labels.buyAria} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/tablet: card grid */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="border border-gray-200 rounded-2xl p-5">
            {plan.hasNearZeroDowntime && (
              <div className="mb-2">
                <NearZeroDowntimeBadge label={labels.nearZeroDowntime} />
              </div>
            )}
            {plan.isMostPopular && (
              <div className="mb-2">
                <MostPopularBadge label={labels.mostPopular} />
              </div>
            )}

            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="min-w-0">
                <h4 className="font-bold text-navy-dark text-base mb-1">
                  {planDisplayName(plan)}
                </h4>
                <FeaturesPopover
                  planName={planDisplayName(plan)}
                  features={features}
                  featuresLabel={labels.features}
                />
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-navy-dark text-lg">
                  {formatPrice(getPrice(plan))}
                </div>
                <div className="text-xs text-gray-500">{periodLabel}</div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500">{labels.cpus}</span>
                <strong className="text-navy-dark">{plan.cpus}</strong>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500">{labels.storage}</span>
                <strong className="text-navy-dark">
                  {plan.storageGb} <span className="font-normal text-gray-500">GB</span>
                </strong>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500">{labels.ram}</span>
                <strong className="text-navy-dark">
                  {plan.ramGb} <span className="font-normal text-gray-500">GB</span>
                </strong>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <BuyButton planName={plan.name} ariaTemplate={labels.buyAria} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
