import { resolveRedirectData } from '$lib/redirect.js';

/**
 * [slug] route — derives title from URL slug if no title query param is provided.
 */
export function load({ params, url, request }) {
	const slugTitle = params.slug
		? params.slug
				.split('-')
				.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(' ')
		: '';

	const titleFromQuery = url.searchParams.get('title');
	const customTitle = titleFromQuery || slugTitle || undefined;

	return resolveRedirectData(url, request, { customTitle });
}
