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
    // Hero
    'hero.headline':           'Reliable Managed Ecommerce Hosting',
    'hero.subheadline':        "Full automation, 24/7 premium support, and top developer tooling. Expertise in dedicated, cloud, and cluster hosting with Magento, Shopware, and WooCommerce and more CMS'.",
    'hero.cta.primary':        'Start 14-day free trial',
    'hero.cta.secondary':      'Get free hosting consult',
    // Contact form
    'contactForm.title':                'Would you like to receive more information about our hosting solutions?',
    'contactForm.subtitle':             'Get in contact with one of our experts!',
    'contactForm.firstName':            'Your first name',
    'contactForm.lastName':             'Your last name',
    'contactForm.company':              'Your company name',
    'contactForm.website':              'Your website URL',
    'contactForm.phone':                'Your phone number',
    'contactForm.email':                'Your email',
    'contactForm.message':              'Leave us a message',
    'contactForm.newsletterBefore':     'Yes, keep me informed about ',
    'contactForm.newsletterLinkLabel':  'Hypernode news and updates',
    'contactForm.newsletterAfter':      '.',
    'contactForm.privacyConsentBefore': 'Yes, I have read the ',
    'contactForm.privacyPolicyLabel':   'Privacy Policy',
    'contactForm.privacyConsentAfter':  ' and give consent to Hypernode.com to store my submitted information.*',
    'contactForm.submit':               'Submit',
    'contactForm.errors.required':      'Please complete this required field.',
    'contactForm.errors.email':         'Please enter a valid email address.',
    'contactForm.errors.privacy':       'You must accept the privacy policy.',
    'contactForm.errors.captcha':       'Please complete the captcha.',
    'contactForm.errors.allFields':     'Please complete all required fields.',
    'contactForm.errors.emailSuggestion': 'Did you mean ',
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
    // Hero
    'hero.headline':           'Betrouwbare managed ecommerce hosting',
    'hero.subheadline':        "Volledige automatisering, 24/7 premium support en topdeveloper-tooling. Expertise in dedicated, cloud en cluster hosting met Magento, Shopware, WooCommerce en meer CMS'en.",
    'hero.cta.primary':        'Start 14-daagse proefperiode',
    'hero.cta.secondary':      'Gratis hostingadvies',
    // Contact form
    'contactForm.title':                'Wilt u meer informatie ontvangen over onze hostingoplossingen?',
    'contactForm.subtitle':             'Neem contact op met een van onze experts!',
    'contactForm.firstName':            'Uw voornaam',
    'contactForm.lastName':             'Uw achternaam',
    'contactForm.company':              'Uw bedrijfsnaam',
    'contactForm.website':              'Uw website-URL',
    'contactForm.phone':                'Uw telefoonnummer',
    'contactForm.email':                'Uw e-mail',
    'contactForm.message':              'Laat ons een bericht achter',
    'contactForm.newsletterBefore':     'Ja, houd mij op de hoogte van ',
    'contactForm.newsletterLinkLabel':  'Hypernode nieuws en updates',
    'contactForm.newsletterAfter':      '.',
    'contactForm.privacyConsentBefore': 'Ja, ik heb het ',
    'contactForm.privacyPolicyLabel':   'Privacybeleid',
    'contactForm.privacyConsentAfter':  ' gelezen en geef toestemming aan Hypernode.com om mijn ingediende gegevens op te slaan.*',
    'contactForm.submit':               'Verzenden',
    'contactForm.errors.required':      'Vul dit verplichte veld in.',
    'contactForm.errors.email':         'Voer een geldig e-mailadres in.',
    'contactForm.errors.privacy':       'U moet het privacybeleid accepteren.',
    'contactForm.errors.captcha':       'Voltooi de captcha.',
    'contactForm.errors.allFields':     'Vul alle verplichte velden in.',
    'contactForm.errors.emailSuggestion': 'Bedoelde u ',
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
