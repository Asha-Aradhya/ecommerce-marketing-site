import * as z from 'zod/v4';

const prerender = false;
const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Valid email is required"),
  company: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  newsletter: z.boolean().optional(),
  privacyConsent: z.literal(true, { error: "Privacy policy consent is required" }),
  captchaToken: z.string().min(1, "Captcha is required")
});
function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
async function forwardToCrm(payload) {
  const url = process.env.LEAD_API_URL;
  const token = process.env.LEAD_API_TOKEN;
  if (!url) return;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...token ? { Authorization: `Bearer ${token}` } : {}
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.warn(
        `[contact] CRM forward returned ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[contact] CRM forward failed: ${message}`);
  }
}
const POST = async ({ request }) => {
  let parsedBody;
  try {
    parsedBody = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
  }
  const result = contactSchema.safeParse(parsedBody);
  if (!result.success) {
    return jsonResponse(
      {
        success: false,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      },
      400
    );
  }
  console.log("[contact] Submission received", {
    email: result.data.email,
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    receivedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  await forwardToCrm(result.data);
  return jsonResponse(
    { success: true, message: "Thanks — we will be in touch shortly." },
    200
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
