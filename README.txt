R-Link Help Center — Vercel Deploy Bundle
==========================================

Last refreshed: 29 September 2026.

FIRST DEPLOY (no code tools needed)
-----------------------------------
1. Unzip this folder on your computer.
2. vercel.com -> Add New -> Project.
3. Easiest: install the Vercel CLI once (npm i -g vercel), then in this
   folder run:  vercel --prod
   Or: push this folder to a GitHub repo and click "Import" in Vercel.
4. Framework preset: Other. Build command: none. Output directory: ./ (root).
5. Deploy. You'll get a *.vercel.app URL. Check it works.

CONNECT learn.r-link.com
------------------------
1. Project -> Settings -> Domains -> Add -> learn.r-link.com
2. Vercel shows a DNS record, usually:
     Type CNAME   Name: learn   Value: cname.vercel-dns.com
3. At your DNS provider for r-link.com, remove the existing "learn" record
   (currently pointing to the GHL funnel) and add the one above.
4. In GHL, remove learn.r-link.com from the old Help Center funnel's domain.
5. Vercel verifies and issues SSL automatically (minutes, up to ~1 hour).

PUSHING UPDATES
---------------
Replace the changed files, bump the ?v= numbers in index.html, then run
vercel --prod again (or git push if connected to GitHub).
Vercel keeps every deployment: Deployments -> ... -> Promote to roll back.

FILES
-----
  index.html, hc-app.js, articles-data.js, screenshots-data.js,
  src/article-bodies.js, src/src-content.css, assets/img/, 404.html
  vercel.json  — Vercel cache + security headers
  _headers     — Cloudflare/Netlify only; ignored by Vercel
