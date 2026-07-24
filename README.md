# Daily Life Comics — Smart Link Redirector

Humsurf generates shareable, social-media-friendly redirect links. When you share a Humsurf link on Facebook, Twitter, LinkedIn, WhatsApp, Discord, or Slack, the platform fetches rich Open Graph / Twitter Card meta tags and displays a beautiful preview with your custom image, title, and description. When a real person clicks the link, they are seamlessly redirected to the actual destination.

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Environment Variables](#environment-variables)
5. [Adding Preview Images](#adding-preview-images)
6. [Generating Links](#generating-links)
7. [Sharing Links](#sharing-links)
8. [Deployment (Cloudflare Workers)](#deployment-cloudflare-workers)
9. [Project Structure](#project-structure)
10. [Security](#security)
11. [Troubleshooting](#troubleshooting)

---

## How It Works

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│  You create  │────▶│  Share the link on  │────▶│  Platform fetches    │
│  a signed    │     │  social media       │     │  OG meta tags, shows │
│  redirect URL│     │                     │     │  rich preview        │
└──────────────┘     └─────────────────────┘     └──────────────────────┘
                                                          │
                                                          ▼
                                                ┌──────────────────────┐
                                                │  Real person clicks  │
                                                │  → 3s countdown →    │
                                                │  redirected to       │
                                                │  target URL          │
                                                └──────────────────────┘
```

- **Social media crawlers** (Facebook, Twitter, LinkedIn, WhatsApp, etc.) receive a static HTML page with full Open Graph and Twitter Card meta tags — they are *not* redirected.
- **Mobile users** are redirected instantly (302) to the target URL.
- **Desktop users** see a preview page for 3 seconds, then are redirected via meta-refresh.
- **Every link is cryptographically signed** with HMAC-SHA256 to prevent open-redirect abuse.

---

## Prerequisites

- **Node.js** 18 or later
- **npm** (comes with Node.js)
- A **Cloudflare account** (free tier works)

---

## Setup

### 1. Clone & install dependencies

```bash
cd "Cloud Comics"
npm install
```

### 2. Create environment file

Create a `.env` file in the project root:

```bash
# Required — used to sign redirect URLs (prevents tampering)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
URL_SIGNING_SECRET=a1b2c3d4e5f6...your-64-char-hex-secret

# Required — password to access the link generator page
LINK_GEN_PASSWORD=your-secure-password-here

# Optional — Facebook App ID for enhanced Open Graph sharing insights
FACEBOOK_APP_ID=
```

### 3. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `URL_SIGNING_SECRET` | **Yes** | HMAC key for signing redirect URLs. Must be at least 32 random bytes (64 hex chars). Generate with the command above. |
| `LINK_GEN_PASSWORD` | **Yes** | Password to access the link generator at `/`. Anyone who knows this can create redirect links. |
| `FACEBOOK_APP_ID` | No | Your Facebook App ID. If set, `fb:app_id` meta tag is included for Facebook sharing analytics. |

> **Important:** These variables must also be set as Cloudflare Worker secrets when deploying (see [Deployment](#deployment-cloudflare-workers)).

---

## Adding Preview Images

Place your preview images in the `static/images/` directory:

```
static/
└── images/
    ├── my-post-preview.png
    ├── product-launch.jpg
    └── blog-thumbnail.webp
```

- Recommended dimensions: **1200 × 630 pixels** (optimal for most social platforms)
- Supported formats: PNG, JPEG, WebP
- Max file size: keep under 5 MB for fast crawler fetching

---

## Generating Links

### Step 1: Log in

Visit `http://localhost:5173/` (or your deployed domain). You will see a password prompt:

```
┌─────────────────────────────────────────┐
│  Please enter the password to access    │
│  the generator:                         │
│                                         │
│  [················]                     │
│                                         │
│  [ Login ]                              │
└─────────────────────────────────────────┘
```

Enter the password you set in `LINK_GEN_PASSWORD`.

> After 5 failed attempts from the same IP, you will be locked out for 15 minutes.

### Step 2: Fill in the form

Once authenticated, you'll see the link generator form:

| Field | Required | Description |
|-------|----------|-------------|
| **Target Website URL** | Yes | The full URL you want users to be redirected to (e.g., `https://example.com/blog/my-post`) |
| **Image Filename** | No | The image filename from `static/images/` (e.g., `my-post-preview.png`). No paths — just the filename. |
| **Custom Title** | No | The title shown in social media previews. If empty, the URL slug is used. |
| **Custom Description** | No | The description text shown below the title in social media previews. |

### Step 3: Generate & copy

Click **Generate Link**. A signed URL is created:

```
https://yourdomain.com/my-awesome-post?url=https%3A%2F%2Fexample.com%2Fblog%2Fmy-post&image=my-post-preview.png&title=My+Awesome+Post&description=A+great+read&sig=a1b2c3d4...
```

Click **Copy** to copy it to your clipboard.

The URL path slug is automatically derived from the title (spaces become hyphens, special characters removed). If no title is provided, the slug defaults to `post`.

---

## Sharing Links

### On Social Media

Simply paste the generated Humsurf link into a post on:

| Platform | Preview Behavior |
|----------|-----------------|
| **Facebook** | Shows image, title, description (Open Graph) |
| **Twitter / X** | Shows large summary card with image (Twitter Card) |
| **LinkedIn** | Shows image, title, description |
| **WhatsApp** | Shows image preview in chat |
| **Discord** | Shows embed with image and description |
| **Slack** | Shows unfurl with image and title |
| **Telegram** | Shows instant view preview |

### In Email / Direct Messages

Anyone clicking the link will:
1. See a preview page with your image, title, and description
2. Be automatically redirected to the target URL after **3 seconds**
3. On mobile, redirection is **instant** (no preview page)

### Testing Previews

Use these tools to verify your link previews before sharing:

- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

---

## Deployment (Cloudflare Workers)

### 1. Install Wrangler (if not already)

```bash
npm install -g wrangler
```

### 2. Log in to Cloudflare

```bash
wrangler login
```

### 3. Set Worker secrets

All environment variables must be set as Cloudflare Worker secrets:

```bash
wrangler secret put URL_SIGNING_SECRET
# Paste your secret when prompted

wrangler secret put LINK_GEN_PASSWORD
# Paste your password when prompted

wrangler secret put FACEBOOK_APP_ID
# Paste your App ID (or press Enter for empty)
```

### 4. Deploy

```bash
npm run build
wrangler deploy
```

### 5. (Optional) Set up a custom domain

1. In the Cloudflare Dashboard, go to **Workers & Pages** → your worker
2. Click **Triggers** → **Custom Domains** → **Add Custom Domain**
3. Enter your domain (e.g., `links.yourdomain.com`)

---

## Project Structure

```
├── package.json              # Dependencies & scripts
├── svelte.config.js           # SvelteKit config (Cloudflare adapter)
├── vite.config.js             # Vite config
├── wrangler.toml              # Cloudflare Workers config
├── .env                       # Environment variables (local dev only)
├── static/
│   └── images/                # Place your preview images here
└── src/
    ├── app.html               # HTML shell
    ├── app.css                # Global styles
    ├── lib/
    │   ├── urlSigner.js       # HMAC-SHA256 signing & verification
    │   ├── sanitize.js        # Image filename sanitization
    │   ├── rateLimiter.js     # Login rate limiter (5 attempts / 15 min)
    │   ├── redirect.js        # Shared server-side redirect logic
    │   └── RedirectPage.svelte # Shared UI component for redirect pages
    └── routes/
        ├── +layout.svelte     # Shared header/navigation
        ├── +page.server.js    # Homepage: login & link generation (server)
        ├── +page.svelte       # Homepage: login & link generation (UI)
        ├── [slug]/
        │   ├── +page.server.js # Slug route: signature verify + redirect
        │   └── +page.svelte    # Slug route: renders RedirectPage
        ├── post/
        │   ├── +page.server.js # Legacy /post route
        │   └── +page.svelte    # Legacy /post route
        └── contact/
            └── +page.svelte    # Contact page
```

---

## Security

| Feature | Implementation |
|---------|---------------|
| **Open redirect prevention** | All redirect URLs are signed with HMAC-SHA256. Tampered or unsigned URLs are rejected. |
| **Brute-force protection** | Login is rate-limited: 5 attempts per IP per 15-minute window. |
| **Path traversal prevention** | Image filenames are sanitized — directory components, special characters, and hidden-file prefixes are stripped. |
| **URL validation** | Target URLs must be valid `http://` or `https://` URLs. |
| **Input sanitization** | All user inputs are cleaned server-side before use. |

---

## Troubleshooting

### "Missing signature" error when visiting a link

The link is missing the `sig` query parameter. Only links generated through the authenticated form are valid. Manually constructed URLs will be rejected.

### "Invalid or tampered link" error

The signature doesn't match the URL parameters. This happens if:
- The `URL_SIGNING_SECRET` was changed after the link was created
- Someone modified the URL parameters manually
- The link was copied incorrectly

**Fix:** Generate a new link from the generator.

### "Server configuration error" on login

The `LINK_GEN_PASSWORD` environment variable is not set. Add it to your `.env` file (local) or as a Cloudflare Worker secret (production).

### "URL_SIGNING_SECRET environment variable is not set"

The signing secret is missing. Add it to your `.env` file or Cloudflare Worker secrets.

### Social media not showing my image

- Verify the image exists in `static/images/`
- Run the URL through Facebook Sharing Debugger to force a re-scrape
- Ensure the image is at least 200×200 pixels (1200×630 recommended)
- Check that the image filename in the URL matches exactly

### Rate limited on login

You've exceeded 5 login attempts. Wait up to 15 minutes or use a different IP address.

