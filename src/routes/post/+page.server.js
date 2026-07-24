import { resolveRedirectData } from '$lib/redirect.js';

/**
 * /post route — uses query params directly for title/description.
 */
export function load({ url, request }) {
	return resolveRedirectData(url, request);
}
