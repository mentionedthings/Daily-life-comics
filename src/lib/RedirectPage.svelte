<script>
	/** @type {import('./$types').PageData & { error?: string }} */
	export let data;

	/** Redirect delay in seconds for desktop users. Default 3. */
	export let redirectDelay = 3;

	// Derive all values safely from data
	$: error = data?.error;
	$: redirectUrl = !error && data?.redirectUrl;
	$: imageSrc = !error && data?.imageSrc;
	$: absoluteImageSrc = !error && data?.absoluteImageSrc;
	$: customTitle = !error && (data?.customTitle || 'Shared Content');
	$: customDescription = !error && data?.customDescription;
	$: pageUrl = !error && data?.pageUrl;
	$: isCrawler = !error && data?.isCrawler;
	$: isMobile = !error && data?.isMobile;
	$: fbAppId = !error && data?.fbAppId;
</script>

<!-- Debug Info (visible only in development) -->
{#if import.meta.env.DEV && !error}
	<div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc;">
		<h3>Debug Information</h3>
		<p><strong>Page URL:</strong> {pageUrl}</p>
		<p><strong>Redirecting to:</strong> {redirectUrl}</p>
		<p><strong>Image URL:</strong> {absoluteImageSrc || 'No image'}</p>
		<p><strong>Is Crawler:</strong> {isCrawler}</p>
		<p><strong>Is Mobile:</strong> {isMobile}</p>
	</div>
{/if}

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{customTitle || 'Shared Content'}</title>
	<meta name="description" content={customDescription || ''} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:title" content={customTitle || 'Shared Content'} />
	<meta property="og:description" content={customDescription || ''} />
	{#if absoluteImageSrc}
		<meta property="og:image" content={absoluteImageSrc} />
		<meta property="og:image:secure_url" content={absoluteImageSrc.replace('http://', 'https://')} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content={customTitle || 'Shared Content'} />
		<meta property="og:image:type" content="image/jpeg" />
	{/if}
	<meta property="og:site_name" content="Humsurf" />
	<meta property="og:locale" content="en_US" />

	<!-- Facebook App ID (if provided) -->
	{#if fbAppId}
		<meta property="fb:app_id" content={fbAppId} />
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={customTitle || 'Shared Content'} />
	<meta name="twitter:description" content={customDescription || ''} />
	<meta name="twitter:site" content="@humsurf" />
	{#if absoluteImageSrc}
		<meta name="twitter:image" content={absoluteImageSrc} />
		<meta name="twitter:image:alt" content={customTitle || 'Shared Content'} />
	{/if}

	<!-- Additional recommended meta tags -->
	<meta name="robots" content="index, follow" />
	<meta name="theme-color" content="#2563eb" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<!-- Redirect non-crawler desktop users after a delay -->
	{#if !error && !isCrawler && !isMobile && redirectUrl}
		<meta http-equiv="refresh" content="{redirectDelay};url={redirectUrl}" />
	{/if}
</svelte:head>

<main>
	{#if error}
		<div class="error-container">
			<h1>Invalid Link</h1>
			<p>{error}</p>
			<p>This link appears to be tampered with or is missing its security signature. Please use the link generator to create a valid link.</p>
		</div>
	{:else if isCrawler}
		<!-- Content for crawlers (Facebook, Twitter, etc.) -->
		<h1>{customTitle || 'Shared Content'}</h1>
		{#if customDescription}
			<p>{customDescription}</p>
		{/if}
		{#if absoluteImageSrc}
			<img src={absoluteImageSrc} alt={customTitle || 'Shared Content'} data-pin-description={customDescription || ''} style="max-width: 100%; height: auto;" />
		{/if}
		<p>Continue to: <a href={redirectUrl}>{redirectUrl}</a></p>
	{:else if isMobile}
		<!-- Content for mobile users (should be redirected immediately by server) -->
		<div class="redirect-container">
			<p>Redirecting to the content...</p>
		</div>
	{:else}
		<!-- Content for desktop users (will be redirected after delay) -->
		<div class="redirect-container">
			<h1>{customTitle || 'Shared Content'}</h1>
			{#if absoluteImageSrc}
				<img src={absoluteImageSrc} alt={customTitle || 'Shared Content'} data-pin-description={customDescription || ''} class="preview-image" />
			{/if}
			<p>You are being redirected to: <a href={redirectUrl}>{redirectUrl}</a></p>
			<p>If you are not redirected automatically, <a href={redirectUrl}>click here</a>.</p>
			<div class="countdown">Redirecting in {redirectDelay} seconds...</div>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}

	.redirect-container {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 2rem;
		margin-top: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.preview-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin: 1rem 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	a {
		color: #2563eb;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	h1 {
		color: #1f2937;
		margin-bottom: 1rem;
	}

	p {
		color: #4b5563;
		line-height: 1.6;
	}

	.countdown {
		margin-top: 1rem;
		color: #6b7280;
		font-style: italic;
	}

	.error-container {
		background: #fef2f2;
		border: 1px solid #fca5a5;
		border-radius: 8px;
		padding: 2rem;
		margin-top: 2rem;
		color: #991b1b;
	}

	.error-container h1 {
		color: #991b1b;
	}
</style>
