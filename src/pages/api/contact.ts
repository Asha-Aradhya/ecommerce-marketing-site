// Server-rendered POST endpoint for the contact form.
//
// The client-side ContactForm component does its own Zod validation, but we
// also validate server-side because client validation can be bypassed.
//
// If LEAD_API_URL is set in env, we forward the submission to that URL.
// Otherwise the submission is logged to stdout and we return success — useful
// for dev and for take-home demos where there's no CRM yet.

import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

export const prerender = false;

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Valid email is required'),
  company: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  newsletter: z.boolean().optional(),
  privacyConsent: z.literal(true, { error: 'Privacy policy consent is required' }),
  captchaToken: z.string().min(1, 'Captcha is required'),
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function forwardToCrm(payload: unknown): Promise<void> {
  const url = import.meta.env.LEAD_API_URL ?? process.env.LEAD_API_URL;
  const token = import.meta.env.LEAD_API_TOKEN ?? process.env.LEAD_API_TOKEN;
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.warn(
        `[contact] CRM forward returned ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[contact] CRM forward failed: ${message}`);
  }
}

export const POST: APIRoute = async ({ request }) => {
  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const result = contactSchema.safeParse(parsedBody);
  if (!result.success) {
    return jsonResponse(
      {
        success: false,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      400,
    );
  }

  console.log('[contact] Submission received', {
    email: result.data.email,
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    receivedAt: new Date().toISOString(),
  });

  await forwardToCrm(result.data);

  return jsonResponse(
    { success: true, message: 'Thanks — we will be in touch shortly.' },
    200,
  );
};
