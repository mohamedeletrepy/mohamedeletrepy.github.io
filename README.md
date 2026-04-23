# mohamedeletrepy.github.io — Personal Cybersecurity Blog

> Dark red-team themed personal blog built with **Astro**, deployed on **GitHub Pages**.

**Live site:** https://mohamedeletrepy.github.io

---

## 📁 Folder Structure

```
mohamedeletrepy.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
├── public/
│   ├── favicon.svg             # Terminal >_ icon
│   └── robots.txt              # SEO robots file
├── src/
│   ├── components/
│   │   ├── Footer.astro        # Site footer with social links
│   │   ├── Navbar.astro        # Fixed navbar with search trigger
│   │   ├── PostCard.astro      # Blog post card component
│   │   ├── SearchModal.astro   # Client-side search modal (⌘K)
│   │   └── TableOfContents.astro # Sticky TOC for blog posts
│   ├── content/
│   │   ├── config.ts           # Content collection schema
│   │   └── blog/
│   │       ├── active-directory-attack-chain.md
│   │       └── jwt-vulnerabilities-bypass.md
│   ├── layouts/
│   │   ├── BaseLayout.astro    # Base HTML shell with SEO meta tags
│   │   └── BlogPost.astro      # Single post layout with TOC + copy buttons
│   ├── pages/
│   │   ├── index.astro         # Home page (hero + featured posts)
│   │   ├── about.astro         # About page with profile card
│   │   ├── 404.astro           # Custom 404 page
│   │   ├── rss.xml.ts          # RSS feed endpoint
│   │   ├── sitemap.xml.ts      # XML sitemap
│   │   ├── blog/
│   │   │   ├── index.astro     # Blog listing page
│   │   │   └── [...slug].astro # Dynamic post pages
│   │   └── tags/
│   │       ├── index.astro     # All tags page
│   │       └── [tag].astro     # Posts filtered by tag
│   └── styles/
│       └── global.css          # Full design system & theme
├── astro.config.mjs            # Astro configuration
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🚀 GitHub Pages Deployment — Step by Step

### Step 1: Create Your GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `mohamedeletrepy.github.io` *(must be exactly your username + .github.io)*
3. Set to **Public**
4. Do **NOT** initialize with README, .gitignore, or license
5. Click **Create repository**

---

### Step 2: Push the Code

Open your terminal in the project folder:

```bash
# 1. Initialize git (if not done)
cd mohamedeletrepy.github.io
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "feat: initial blog setup with Astro"

# 4. Rename branch to main
git branch -M main

# 5. Add your GitHub remote (replace with YOUR username)
git remote add origin https://github.com/mohamedeletrepy/mohamedeletrepy.github.io.git

# 6. Push to GitHub
git push -u origin main
```

---

### Step 3: Enable GitHub Pages with GitHub Actions

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **GitHub Actions**
4. That's it — the workflow in `.github/workflows/deploy.yml` handles everything

---

### Step 4: Trigger a Deployment

The site deploys automatically on every push to `main`. To trigger manually:

```bash
# Make any change and push
git add .
git commit -m "deploy: trigger first build"
git push
```

Or go to **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

---

### Step 5: Verify Deployment

After ~1-2 minutes, visit: **https://mohamedeletrepy.github.io**

Check the **Actions** tab on GitHub to see the build progress. Green checkmark = deployed.

---

## ✍️ Writing New Blog Posts

Create a new `.md` file in `src/content/blog/`:

```bash
touch src/content/blog/my-new-post.md
```

Add the frontmatter at the top:

```markdown
---
title: "My Post Title"
description: "A short description for SEO and previews."
pubDate: 2024-05-01
tags: ["Active Directory", "Red Team", "Windows"]
author: "Ahmed Eletreby"
readingTime: 8
---

Your content starts here...
```

Then push — the site rebuilds automatically.

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Post title |
| `description` | ✅ | SEO description (150 chars max) |
| `pubDate` | ✅ | Publication date `YYYY-MM-DD` |
| `tags` | ✅ | Array of tags |
| `author` | ❌ | Defaults to "Ahmed Eletreby" |
| `readingTime` | ❌ | Estimated minutes to read |
| `draft` | ❌ | Set to `true` to hide from build |
| `updatedDate` | ❌ | Last updated date |

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev
# → http://localhost:4321

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🎨 Customization

### Change Your Name/Bio

Edit `src/pages/index.astro` and `src/pages/about.astro`.

### Change Social Links

Edit `src/components/Footer.astro` and `src/pages/about.astro` — update the GitHub/LinkedIn `href` values.

### Change the Site URL

Edit `astro.config.mjs`:
```js
site: 'https://your-username.github.io',
```

### Add Google Analytics

In `src/layouts/BaseLayout.astro`, add inside `<head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Change Color Accent

In `src/styles/global.css`, update:
```css
--accent-green: #00e5ff;   /* Change to any color */
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Markdown blog posts | ✅ |
| Syntax highlighting (One Dark Pro) | ✅ |
| Copy-to-clipboard on code blocks | ✅ |
| Client-side search (⌘K) | ✅ |
| Table of contents (sticky) | ✅ |
| Tags & categories | ✅ |
| Dark mode (default) | ✅ |
| SEO meta tags + OG tags | ✅ |
| RSS feed at `/rss.xml` | ✅ |
| XML sitemap at `/sitemap.xml` | ✅ |
| GitHub Actions CI/CD | ✅ |
| Responsive (mobile + desktop) | ✅ |
| Custom 404 page | ✅ |
| Favicon (SVG) | ✅ |

---

## 📦 Tech Stack

- **Framework:** [Astro](https://astro.build) v4
- **Syntax Highlighting:** [Shiki](https://shiki.matsu.io) (One Dark Pro theme)
- **Fonts:** JetBrains Mono + Syne + DM Sans (Google Fonts)
- **Deployment:** GitHub Pages via GitHub Actions
- **Content:** Astro Content Collections (Markdown)

---

*Built by Ahmed Eletreby — break things legally.*
