import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestEmail } from '@/lib/suggest-email';

// Cloudflare Turnstile dev test key — always passes, no API account needed.
// Replace with a real site key in production.
const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

interface FormLabels {
  firstName: string;
  lastName: string;
  company: string;
  website: string;
  phone: string;
  email: string;
  message: string;
  newsletterBefore: string;
  newsletterLinkLabel: string;
  newsletterAfter: string;
  privacyConsentBefore: string;
  privacyPolicyLabel: string;
  privacyConsentAfter: string;
  submit: string;
  requiredError: string;
  emailError: string;
  privacyError: string;
  captchaError: string;
  allFieldsError: string;
  emailSuggestionPrefix: string;
}

interface Props {
  labels: FormLabels;
  comingSoonHref: string;
}

export default function ContactForm({ labels, comingSoonHref }: Props) {
  const formSchema = z.object({
    firstName: z.string().min(1, labels.requiredError),
    lastName: z.string().min(1, labels.requiredError),
    company: z.string().optional(),
    website: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().min(1, labels.requiredError).email(labels.emailError),
    message: z.string().optional(),
    newsletter: z.boolean().optional(),
    privacyConsent: z.literal(true, {
      errorMap: () => ({ message: labels.privacyError }),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      website: '',
      phone: '',
      email: '',
      message: '',
      newsletter: false,
    },
  });

  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptchaError, setShowCaptchaError] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const emailValue = watch('email');

  useEffect(() => {
    let renderedWidgetId: string | undefined;
    const pollInterval = window.setInterval(() => {
      if (
        window.turnstile &&
        captchaContainerRef.current &&
        !captchaContainerRef.current.hasChildNodes()
      ) {
        window.clearInterval(pollInterval);
        renderedWidgetId = window.turnstile.render(captchaContainerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => {
            setCaptchaToken(token);
            setShowCaptchaError(false);
          },
        });
      }
    }, 100);
    return () => {
      window.clearInterval(pollInterval);
      if (renderedWidgetId && window.turnstile) {
        window.turnstile.reset(renderedWidgetId);
      }
    };
  }, []);

  useEffect(() => {
    if (emailValue && emailValue.includes('@')) {
      setEmailSuggestion(suggestEmail(emailValue));
    } else {
      setEmailSuggestion(null);
    }
  }, [emailValue]);

  const onSubmit = async (data: FormValues) => {
    if (!captchaToken) {
      setShowCaptchaError(true);
      return;
    }
    setShowCaptchaError(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, captchaToken }),
      });
      if (!response.ok) {
        console.warn('[contact-form] Submission failed', response.status);
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[contact-form] Network error:', message);
      return;
    }

    window.location.href = comingSoonHref;
  };

  const inputClass =
    'w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-base text-navy-dark placeholder:text-navy-dark/60 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 transition-colors';
  const errorClass = 'text-red-500 text-sm mt-1 ml-6';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <input
            {...register('firstName')}
            type="text"
            placeholder={labels.firstName}
            className={inputClass}
          />
          {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
        </div>

        <div>
          <input
            {...register('lastName')}
            type="text"
            placeholder={labels.lastName}
            className={inputClass}
          />
          {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
        </div>

        <div>
          <input
            {...register('company')}
            type="text"
            placeholder={labels.company}
            className={inputClass}
          />
        </div>

        <div>
          <input
            {...register('website')}
            type="text"
            placeholder={labels.website}
            className={inputClass}
          />
        </div>

        <div>
          <input
            {...register('phone')}
            type="tel"
            placeholder={labels.phone}
            className={inputClass}
          />
        </div>

        <div>
          <input
            {...register('email')}
            type="email"
            placeholder={labels.email}
            className={inputClass}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          {!errors.email && emailSuggestion && (
            <p className="text-sm mt-1 ml-6 text-navy-dark/70">
              {labels.emailSuggestionPrefix}
              <button
                type="button"
                className="text-orange hover:text-orange-dark underline ml-1"
                onClick={() => {
                  setValue('email', emailSuggestion, { shouldValidate: true });
                  setEmailSuggestion(null);
                }}
              >
                {emailSuggestion}
              </button>
              ?
            </p>
          )}
        </div>
      </div>

      <textarea
        {...register('message')}
        placeholder={labels.message}
        rows={4}
        className="w-full rounded-3xl border border-gray-300 bg-white px-6 py-3 text-base text-navy-dark placeholder:text-navy-dark/60 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 transition-colors resize-none"
      />

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer text-sm text-navy-dark">
          <input
            {...register('newsletter')}
            type="checkbox"
            className="mt-1 accent-orange shrink-0"
          />
          <span>
            {labels.newsletterBefore}
            <a href={comingSoonHref} className="text-orange hover:text-orange-dark">
              {labels.newsletterLinkLabel}
            </a>
            {labels.newsletterAfter}
          </span>
        </label>

        <div>
          <label className="flex items-start gap-3 cursor-pointer text-sm text-navy-dark">
            <input
              {...register('privacyConsent')}
              type="checkbox"
              className="mt-1 accent-orange shrink-0"
            />
            <span>
              {labels.privacyConsentBefore}
              <a href={comingSoonHref} className="text-orange hover:text-orange-dark">
                {labels.privacyPolicyLabel}
              </a>
              {labels.privacyConsentAfter}
            </span>
          </label>
          {errors.privacyConsent && <p className={errorClass}>{errors.privacyConsent.message}</p>}
        </div>
      </div>

      <div ref={captchaContainerRef} className="flex justify-center" />
      {showCaptchaError && (
        <p className="text-red-500 text-sm text-center">{labels.captchaError}</p>
      )}

      {isSubmitted && Object.keys(errors).length > 0 && (
        <p className="text-red-500 text-sm text-center">{labels.allFieldsError}</p>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-full px-12 py-3 transition-colors"
        >
          {labels.submit}
        </button>
      </div>
    </form>
  );
}
