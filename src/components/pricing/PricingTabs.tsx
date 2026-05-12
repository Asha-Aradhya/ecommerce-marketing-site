import { useState, useEffect } from 'react';
import PricingTable from './PricingTable';
import Toggle from '@/components/ui/Toggle';
import type { Plan, PricingTabsLabels } from '@/types/pricing';

type Mode = 'production' | 'development';

interface Props {
  plans: Plan[];
  labels: PricingTabsLabels;
}

const CubeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

type SectionId = 'cloud-pricing' | 'dedicated-pricing';

export default function PricingTabs({ plans, labels }: Props) {
  const [mode, setMode] = useState<Mode>('production');
  const [activeSection, setActiveSection] = useState<SectionId>('cloud-pricing');

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      '#cloud-pricing, #dedicated-pricing',
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (intersecting.length === 0) return;

        const mostVisible = intersecting.reduce((bestEntry, currentEntry) =>
          currentEntry.intersectionRatio > bestEntry.intersectionRatio ? currentEntry : bestEntry,
        );
        setActiveSection(mostVisible.target.id as SectionId);
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const filterByLine = (line: string) =>
    plans
      .filter((plan) => plan.hardwareLine === line)
      .sort((firstPlan, secondPlan) => firstPlan.order - secondPlan.order);

  const combellPlans = filterByLine('combell-openstack');
  const awsPlans = filterByLine('aws');
  const enterprisePlans = filterByLine('jackal-enterprise');
  const standardPlans = filterByLine('jackal');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-6">
            <Toggle
              leftLabel={labels.production}
              rightLabel={labels.development}
              isLeft={mode === 'production'}
              onToggle={() => setMode(mode === 'production' ? 'development' : 'production')}
            />
          </div>

          <nav className="space-y-3 mb-8">
            <a
              href="#cloud-pricing"
              className={`flex items-start gap-3 p-3 rounded-xl bg-white border-2 no-underline ${
                activeSection === 'cloud-pricing'
                  ? 'border-orange'
                  : 'border-gray-200 hover:border-orange/40 transition-colors'
              }`}
            >
              <span className="shrink-0 w-10 h-10 bg-blue-pale rounded flex items-center justify-center text-navy-dark">
                <CubeIcon />
              </span>
              <div>
                <div className="font-bold text-navy-dark">{labels.cloud}</div>
                <div className="text-xs text-gray-500">{labels.cloudSubtitle}</div>
              </div>
            </a>

            <a
              href="#dedicated-pricing"
              className={`flex items-start gap-3 p-3 rounded-xl bg-white border-2 no-underline ${
                activeSection === 'dedicated-pricing'
                  ? 'border-orange'
                  : 'border-gray-200 hover:border-orange/40 transition-colors'
              }`}
            >
              <span className="shrink-0 w-10 h-10 bg-blue-pale rounded flex items-center justify-center text-navy-dark">
                <CubeIcon />
              </span>
              <div>
                <div className="font-bold text-navy-dark">{labels.dedicated}</div>
                <div className="text-xs text-gray-500">{labels.dedicatedSubtitle}</div>
              </div>
            </a>
          </nav>

          <div className="text-sm text-navy-dark text-center border-t border-gray-200 pt-6">
            <p className="mb-4">{labels.unsureCopy}</p>
            <a
              href={labels.consultHref}
              className="inline-block bg-orange hover:bg-orange-dark text-white font-semibold rounded-full px-6 py-3 text-sm transition-colors no-underline"
            >
              {labels.consultCta}
            </a>
          </div>
        </aside>

        <div className="min-w-0">
          <section id="cloud-pricing" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-dark mb-3">
              {labels.cloudHeading}
            </h2>
            <p className="text-navy-dark text-sm md:text-base mb-2">{labels.cloudIntro}</p>
            <p className="text-navy-dark text-sm md:text-base font-medium">
              {labels.cloudNoteBefore}
              <span className="text-orange">Brancher</span>
              {labels.cloudNoteAfter}
            </p>

            <PricingTable
              title={labels.combellTitle}
              plans={combellPlans}
              mode={mode}
              labels={labels.table}
            />
            <PricingTable
              title={labels.awsTitle}
              plans={awsPlans}
              mode={mode}
              labels={labels.table}
            />
          </section>

          <section id="dedicated-pricing" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-dark mb-3">
              {labels.dedicatedHeading}
            </h2>
            <p className="text-navy-dark text-sm md:text-base">{labels.dedicatedIntro}</p>

            <PricingTable
              title={labels.enterpriseTitle}
              plans={enterprisePlans}
              mode={mode}
              labels={labels.table}
            />
            <PricingTable
              title={labels.standardTitle}
              plans={standardPlans}
              mode={mode}
              labels={labels.table}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
