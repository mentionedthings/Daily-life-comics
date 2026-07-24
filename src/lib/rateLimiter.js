/**
 * In-memory rate limiter for Cloudflare Workers / SvelteKit.
 *
 * Tracks attempts per key (e.g. IP address) within a sliding time window.
 * Not shared across worker isolates — for production multi-isolate deployments,
 * consider Cloudflare KV, Durable Objects, or a cookie-based approach.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean up stale entries every 5 minutes

/** @type {Map<string, number[]>} */
const attempts = new Map();

let lastCleanup = Date.now();

/** Remove entries older than the window. */
function cleanup() {
	const now = Date.now();
	if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
	lastCleanup = now;

	const cutoff = now - WINDOW_MS;
	for (const [key, timestamps] of attempts) {
		const recent = timestamps.filter((t) => t > cutoff);
		if (recent.length === 0) {
			attempts.delete(key);
		} else {
			attempts.set(key, recent);
		}
	}
}

/**
 * Check if the given key has exceeded the rate limit.
 *
 * @param {string} key - Identifier for the client (e.g. IP address).
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
export function checkRateLimit(key) {
	cleanup();

	const now = Date.now();
	const cutoff = now - WINDOW_MS;

	const timestamps = (attempts.get(key) || []).filter((t) => t > cutoff);
	timestamps.push(now);
	attempts.set(key, timestamps);

	const count = timestamps.length;
	const remaining = Math.max(0, MAX_ATTEMPTS - count);

	if (count > MAX_ATTEMPTS) {
		// The oldest attempt that keeps us over the limit determines the reset time
		const oldestInWindow = timestamps[0];
		const retryAfterMs = oldestInWindow + WINDOW_MS - now;
		return { allowed: false, remaining: 0, retryAfterMs };
	}

	return { allowed: true, remaining, retryAfterMs: 0 };
}
