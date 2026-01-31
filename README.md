# ⚡ Critical CSS Generator with Puppeteer

A Node.js–based tool for automated critical CSS extraction and static HTML generation, built to significantly improve page load performance and Core Web Vitals, especially Largest Contentful Paint (LCP).

This project uses real browser analysis via Puppeteer to inline only the CSS actually required for above-the-fold rendering.

# 🚀 Performance Results

Measured improvements after applying critical CSS inlining:

## LCP reduced: ~0.8s → ~0.3s → ~0.18s

Faster first paint

Reduced render-blocking CSS

Improved perceived loading speed

# 🧠 Optimization Strategy

1. The optimization follows one core idea:
2. Only load what the browser actually needs to render the first view.
3. Instead of manually defining critical CSS, this tool:
- pens pages in a real browser
- measures which CSS rules are actually used
- inlines only those rules
- defers non-critical resources

# ⚙️ How It Works

Launches a headless Chromium instance using Puppeteer
Crawls all internal links starting from a base URL
For each page:
- Starts CSS coverage tracking
- Loads the page until the network is idle
- Extracts only the used CSS ranges
- Builds a critical CSS block
- Injects critical CSS directly into the head
- Defers JavaScript execution
- Generates static HTML files for each route
- Serves optimized pages via an Express server

# 🛠️ Tech Stack

Node.js
Express
Puppeteer
Chrome CSS Coverage API
File-system based static generation

# 📂 Output Structure

Generated static HTML files are stored in:
/static/wordpress/
home.html
about.html
…

Each page includes:

Inlined critical CSS
Deferred JavaScript
Rewritten internal links for local serving

# 🎯 Use Cases

Core Web Vitals optimization
Performance tooling for CMS / WordPress sites
Static HTML generation pipelines
Lighthouse score improvements
Automated CSS analysis

# ⚠️ Notes

Designed for controlled environments
Base URL and routing can be adapted
Intended as a tooling prototype, not a full production framework
Demonstrates browser-level optimization instead of heuristic CSS guessing

# 📌 Key Takeaway

This project demonstrates how real browser instrumentation can be used to extract true critical CSS and achieve substantial LCP improvements without manual tuning.
