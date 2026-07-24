import { env } from '$env/dynamic/private';

// Minimal set of URL parameters that are part of the signature.
// Changing any of these invalidates the signature.
const SIGNED_PARAMS = ['url', 'image', 'title', 'description'];

/**
 * Derive a CryptoKey from the signing secret for HMAC-SHA256.
 * Uses the Web Crypto API (available on Cloudflare Workers & Node 18+).
 */
async function getKey() {
	const secret = env.URL_SIGNING_SECRET;
	if (!secret) {
		throw new Error('URL_SIGNING_SECRET environment variable is not set.');
	}
	const encoder = new TextEncoder();
	const keyData = encoder.encode(secret);
	return crypto.subtle.importKey(
		'raw',
		keyData,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	);
}

/**
 * Build the canonical string that will be signed.
 * Only includes SIGNED_PARAMS, in a deterministic order, with empty values preserved.
 */
function buildPayload(params) {
	return SIGNED_PARAMS
		.map((key) => `${key}=${encodeURIComponent(params.get(key) || '')}`)
		.join('&');
}

/**
 * Generate an HMAC-SHA256 signature for the given URLSearchParams.
 * Returns a hex string.
 */
async function sign(params) {
	const key = await getKey();
	const encoder = new TextEncoder();
	const payload = buildPayload(params);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Verify that the provided signature matches the params.
 * Returns true if valid, false if tampered with or missing.
 */
async function verify(params, providedSig) {
	if (!providedSig) return false;
	try {
		const key = await getKey();
		const encoder = new TextEncoder();
		const payload = buildPayload(params);

		// Convert the hex signature back to bytes
		const sigBytes = new Uint8Array(providedSig.length / 2);
		for (let i = 0; i < providedSig.length; i += 2) {
			sigBytes[i / 2] = parseInt(providedSig.substring(i, i + 2), 16);
		}

		return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payload));
	} catch {
		return false;
	}
}

export { sign, verify, SIGNED_PARAMS };
