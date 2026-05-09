export const defaultLang = 'en' as const;

export const ui = {
  en: {
    // Nav
    'nav.plans':          'Plans & prices',
    'nav.changelog':      'Changelog',
    'nav.langSwitch':     'Dutch',
    // Nav hrefs
    'nav.home.href':           '/en/',
    'nav.plans.href':          '/en/plans-and-prices/',
    'nav.changelog.href':      '/en/changelog/',
    'nav.comingSoon.href':     '/en/coming-soon/',
    // Coming soon page
    'comingSoon.title':        'Page under construction',
    'comingSoon.heading':      'This page is under construction',
    'comingSoon.body':         "We're still building this part of the site. Check back soon.",
    'comingSoon.backHome':     'Back to home',
  },
  nl: {
    // Nav
    'nav.plans':          'Abonnementen & prijzen',
    'nav.changelog':      'Changelog',
    'nav.langSwitch':     'English',
    // Nav hrefs
    'nav.home.href':           '/nl/',
    'nav.plans.href':          '/nl/prijzen/',
    'nav.changelog.href':      '/nl/changelog/',
    'nav.comingSoon.href':     '/nl/coming-soon/',
    // Coming soon page
    'comingSoon.title':        'Pagina in aanbouw',
    'comingSoon.heading':      'Deze pagina is in aanbouw',
    'comingSoon.body':         'We werken nog aan dit deel van de site. Kom snel terug.',
    'comingSoon.backHome':     'Terug naar home',
  },
} as const;

export type Lang = keyof typeof ui;
export type TranslationKey = keyof typeof ui[typeof defaultLang];

export function useTranslations(lang: Lang) {
  return (key: TranslationKey): string => ui[lang][key];
}
