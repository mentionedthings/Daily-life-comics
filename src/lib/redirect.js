import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { verify, SIGNED_PARAMS } from '$lib/urlSigner.js';
import { sanitizeImageFilename } from '$lib/sanitize.js';

const CRAWLER_AGENTS = [
	'facebookexternalhit',
	'Twitterbot',
	'LinkedInBot',
	'WhatsApp',
	'Slackbot',
	'Discordbot',
	'TelegramBot',
	'Googlebot',
	'Bingbot',
	'Slurp',
	'DuckDuckBot',
	'Baiduspider',
	'YandexBot',
	'facebot',
	'ia_archiver',
	'archive.org_bot',
	'Applebot',
	'Pinterest'
];

/**
 * Shared load logic for redirect routes.
 *
 * @param {URL} url - The request URL
 * @param {Request} request - The incoming request
 * @param {{ customTitle?: string, customDescription?: string }} overrides
 *   Optional overrides for title/description (used by [slug] to derive title from the slug).
 * @returns {Promise<Object>} - Data for the page, or { error: '...' } on failure
 */
export async function resolveRedirectData(url, request, overrides = {}) {
	// --- Signature verification ---
	const providedSig = url.searchParams.get('sig');
	if (!providedSig) {
		return { error: 'Missing signature. This link may have been tampered with.' };
	}

	const verifyParams = new URLSearchParams();
	for (const key of SIGNED_PARAMS) {
		verifyParams.set(key, url.searchParams.get(key) || '');
	}

	const isValid = await verify(verifyParams, providedSig);
	if (!isValid) {
		return { error: 'Invalid or tampered link.' };
	}

	// --- Extract parameters ---
	const targetUrl = url.searchParams.get('url');
	const imageName = url.searchParams.get('image');
	const customTitle =
		overrides.customTitle !== undefined
			? overrides.customTitle
			: url.searchParams.get('title') || 'Check out this link';
	const customDescription =
		overrides.customDescription !== undefined
			? overrides.customDescription
			: url.searchParams.get('description') || '';

	// --- Detect crawlers & mobile ---
	const userAgent = request.headers.get('user-agent') || '';
	const isCrawler = CRAWLER_AGENTS.some((agent) =>
		userAgent.toLowerCase().includes(agent.toLowerCase())
	);
	const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);

	// --- Sanitize & prepare image URL ---
	const baseUrl = url.origin;
	const cleanImageName = sanitizeImageFilename(imageName || '');
	const imageSrc = cleanImageName ? `/images/${cleanImageName}` : '';
	const absoluteImageSrc = cleanImageName
		? `${baseUrl.replace(/\/+$/, '')}/images/${cleanImageName}`
		: '';

	const pageUrl = url.href;
	const fbAppId = env.FACEBOOK_APP_ID || '';

	// --- Mobile: redirect immediately ---
	if (isMobile && !isCrawler && targetUrl) {
		throw redirect(302, targetUrl);
	}

	// --- Return data for crawler or desktop rendering ---
	return {
		redirectUrl: targetUrl,
		imageSrc,
		absoluteImageSrc,
		customTitle,
		customDescription,
		pageUrl,
		isCrawler,
		isMobile,
		fbAppId
	};
}
