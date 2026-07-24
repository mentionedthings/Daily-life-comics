import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { sign } from '$lib/urlSigner.js';
import { sanitizeImageFilename } from '$lib/sanitize.js';
import { checkRateLimit } from '$lib/rateLimiter.js';

const CORRECT_PASSWORD = env.LINK_GEN_PASSWORD;

function createSlug(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.substring(0, 100);
}

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ request, getClientAddress }) => {
		// Resolve client IP (Cloudflare Workers provides CF-Connecting-IP)
		const clientIp = request.headers.get('CF-Connecting-IP') || getClientAddress();

		// Rate limiting: max 5 attempts per 15 minutes per IP
		const { allowed, remaining, retryAfterMs } = checkRateLimit(clientIp);
		if (!allowed) {
			const retryAfterSec = Math.ceil(retryAfterMs / 1000);
			return fail(429, {
				rateLimited: true,
				retryAfterSec,
				message: `Too many login attempts. Please try again in ${retryAfterSec} seconds.`
			});
		}

		const data = await request.formData();
		const password = data.get('password');

		if (!CORRECT_PASSWORD) {
			console.error('LINK_GEN_PASSWORD environment variable is not set.');
			return fail(500, { error: 'Server configuration error.' });
		}

		if (password === CORRECT_PASSWORD) {
			return { success: true };
		} else {
			return fail(401, {
				incorrect: true,
				remaining,
				message: `Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
			});
		}
	},

	generate: async ({ request, url: pageUrl }) => {
		const data = await request.formData();
		const targetUrl = data.get('url')?.toString() || '';
		const imageFilename = data.get('image')?.toString() || '';
		const customTitle = data.get('title')?.toString() || '';
		const customDescription = data.get('description')?.toString() || '';

		// Validate target URL: must be an http/https URL
		let parsed;
		try {
			parsed = new URL(targetUrl);
			if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
				return fail(400, { generateError: 'Target URL must start with http:// or https://' });
			}
		} catch {
			return fail(400, { generateError: 'Invalid target URL.' });
		}

		// Sanitize image filename: strip path traversal and dangerous characters
		const cleanImage = sanitizeImageFilename(imageFilename);

		// Build the search params that go into the signed URL
		const params = new URLSearchParams();
		params.set('url', targetUrl);
		params.set('image', cleanImage);
		params.set('title', customTitle);
		params.set('description', customDescription);

		// Sign the parameters
		const signature = await sign(params);
		params.set('sig', signature);

		// Build the final URL
		const origin = pageUrl.origin;
		const slug = createSlug(customTitle || 'post');
		const generatedUrl = `${origin}/${slug}?${params.toString()}`;

		return { success: true, generatedUrl };
	}
};
