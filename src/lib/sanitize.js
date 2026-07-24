/**
 * Sanitize an image filename to prevent path traversal attacks.
 * - Converts backslashes to forward slashes
 * - Strips all directory components, keeping only the base filename
 * - Removes any characters that aren't alphanumeric, dots, hyphens, or underscores
 * - Returns empty string if nothing valid remains
 *
 * @param {string} raw - The raw filename from user input
 * @returns {string} - The sanitized filename, or empty string
 */
export function sanitizeImageFilename(raw) {
	if (!raw || typeof raw !== 'string') return '';

	// Normalize slashes and split into path segments
	const segments = raw.replace(/\\/g, '/').split('/');

	// Take only the last segment (the actual filename)
	const filename = segments.pop() || '';

	// Strip any character that isn't a word character, dot, or hyphen
	const cleaned = filename.replace(/[^\w.\-]/g, '');

	// Remove leading dots to prevent hidden files
	return cleaned.replace(/^\.+/, '');
}
