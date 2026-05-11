import { useState } from 'react';
import type { ReactNode } from 'react';

type TabId = 'recommended' | 'launch' | 'reach' | 'optimize';

interface TeamblueLabels {
  heading: string;
  recommended: string;
  launch: string;
  reach: string;
  optimize: string;
  productHref: string;
}

interface Props {
  labels: TeamblueLabels;
}

interface Tab {
  id: TabId;
  label: string;
  icon: ReactNode;
}

interface Product {
  categories: TabId[];
  eyebrow: string;
  description: string;
  productName: string;
  iconLetter: string;
  iconBg: string;
  iconText?: string;
}

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const BrowserIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const PeopleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CursorIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 9l5 12 1.8-5.2L21 14l-12-5z" />
  </svg>
);

function buildTabs(labels: TeamblueLabels): Tab[] {
  return [
    { id: 'recommended', label: labels.recommended, icon: <StarIcon /> },
    { id: 'launch', label: labels.launch, icon: <BrowserIcon /> },
    { id: 'reach', label: labels.reach, icon: <PeopleIcon /> },
    { id: 'optimize', label: labels.optimize, icon: <CursorIcon /> },
  ];
}

const PRODUCTS: Product[] = [
  {
    categories: ['recommended', 'launch'],
    eyebrow: 'AI WEBSITE BUILDER',
    description: 'Launch your site: fast, no code, professional. With',
    productName: 'Webnode',
    iconLetter: 'we',
    iconBg: 'bg-emerald-400',
    iconText: 'text-slate-900',
  },
  {
    categories: ['recommended', 'reach'],
    eyebrow: 'EFFORTLESS SOCIAL MEDIA MANAGEMENT',
    description: 'Manage all social platforms from one place with',
    productName: 'Metricool',
    iconLetter: '∞',
    iconBg: 'bg-lime-300',
    iconText: 'text-slate-900',
  },
  {
    categories: ['recommended', 'launch'],
    eyebrow: 'COMPLIANCE MADE SIMPLE',
    description: 'Keep your site legally compliant with',
    productName: 'iubenda',
    iconLetter: 'i',
    iconBg: 'bg-white',
    iconText: 'text-emerald-700',
  },
  {
    categories: ['recommended', 'reach', 'optimize'],
    eyebrow: 'SMART SCHEDULING',
    description: 'Schedule meetings effortlessly with',
    productName: 'SimplyMeet.me',
    iconLetter: 'C',
    iconBg: 'bg-white',
    iconText: 'text-blue-600',
  },
  {
    categories: ['recommended', 'launch', 'optimize'],
    eyebrow: 'ALL-IN-ONE BUSINESS TOOLKIT',
    description: 'Invoice, book, and accept payments with',
    productName: 'Billdu',
    iconLetter: 'B',
    iconBg: 'bg-blue-700',
    iconText: 'text-white',
  },
  {
    categories: ['recommended', 'launch'],
    eyebrow: 'RELIABLE DOMAIN AND HOSTING',
    description: 'Register your perfect domain with',
    productName: 'TransIP',
    iconLetter: 'tip',
    iconBg: 'bg-white',
    iconText: 'text-red-600',
  },
  {
    categories: ['recommended', 'launch', 'reach', 'optimize'],
    eyebrow: 'BOOKING MADE EASY',
    description: 'Accept client appointments via',
    productName: 'SimplyBook.me',
    iconLetter: 'S',
    iconBg: 'bg-white',
    iconText: 'text-blue-700',
  },
  {
    categories: ['recommended', 'reach'],
    eyebrow: 'B2B LEAD GENERATION',
    description: 'Turn website visitors into leads with',
    productName: 'LeadInfo',
    iconLetter: 'L',
    iconBg: 'bg-red-500',
    iconText: 'text-white',
  },
  {
    categories: ['launch'],
    eyebrow: 'ACCESSIBILITY MADE EASY',
    description: 'Meet accessibility requirements with',
    productName: 'UserWay',
    iconLetter: 'A',
    iconBg: 'bg-white',
    iconText: 'text-slate-900',
  },
  {
    categories: ['launch'],
    eyebrow: 'OPTIMISED E-COMMERCE HOSTING',
    description: 'Scale your online store with',
    productName: 'Hypernode',
    iconLetter: 'HY',
    iconBg: 'bg-blue-700',
    iconText: 'text-white',
  },
  {
    categories: ['launch', 'optimize'],
    eyebrow: 'ALL-IN-ONE FOR NON-PROFITS',
    description: 'Centralize your accounting and donor management with',
    productName: 'Springly',
    iconLetter: '🌱',
    iconBg: 'bg-white',
    iconText: 'text-emerald-700',
  },
  {
    categories: ['reach'],
    eyebrow: 'STRATEGIC INFLUENCER PARTNERSHIPS',
    description: 'Connect with the right influencers using',
    productName: 'Klear',
    iconLetter: 'K',
    iconBg: 'bg-emerald-400',
    iconText: 'text-slate-900',
  },
  {
    categories: ['reach'],
    eyebrow: 'EMAIL THAT CONVERTS',
    description: 'Design targeted email campaigns with',
    productName: 'MailerLite',
    iconLetter: 'X',
    iconBg: 'bg-white',
    iconText: 'text-purple-700',
  },
  {
    categories: ['optimize'],
    eyebrow: 'ELECTRONIC INVOICING',
    description: 'Simplify invoicing and tax reporting with',
    productName: 'Yokoy',
    iconLetter: 'M',
    iconBg: 'bg-blue-700',
    iconText: 'text-white',
  },
];

export default function FooterTeamblue({ labels }: Props) {
  const [activeTabId, setActiveTabId] = useState<TabId>('recommended');
  const tabs = buildTabs(labels);

  const visibleProducts = PRODUCTS.filter((product) =>
    product.categories.includes(activeTabId),
  );

  return (
    <section className="bg-[#0e1320] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-white text-2xl font-bold mb-8 tracking-tight">
          team<span className="text-blue-light">.</span>blue
        </div>

        <h2 className="text-white text-2xl md:text-3xl font-bold mb-10 md:mb-12 leading-tight border-l-4 border-blue-light pl-4">
          <span className="text-blue-light">Hypernode</span> {labels.heading}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white/5 rounded-2xl p-3 self-start">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTabId(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-colors ${
                      activeTabId === tab.id
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="shrink-0">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleProducts.map((product) => (
              <a
                key={product.productName}
                href={labels.productHref}
                className="bg-white/5 hover:bg-white/10 rounded-xl p-5 flex items-start gap-4 transition-colors group no-underline"
              >
                <div
                  className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-base ${product.iconBg} ${product.iconText ?? 'text-white'}`}
                >
                  {product.iconLetter}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-xs uppercase tracking-wide mb-1">
                    {product.eyebrow}
                  </p>
                  <p className="text-white/90 text-sm line-clamp-3">
                    {product.description}{' '}
                    <span className="font-bold text-blue-light">{product.productName}</span>
                  </p>
                </div>
                <svg
                  className="shrink-0 mt-1 text-white/40 group-hover:text-white/80 transition-colors"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
