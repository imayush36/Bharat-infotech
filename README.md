# Bharat Infotechs website + live admin

This build starts from the supplied Bharat Infotechs Cinematic Rebuild. Existing visual design, home page, careers page, blog articles, animations, and video assets are preserved. Admin tools are added alongside the public site.

## Included
- `index.html` — existing cinematic homepage and enquiry flow.
- `careers.html`, `blog*.html` — existing public pages.
- `admin.html` — Supabase-authenticated dashboard: page-view analytics, shared enquiry inbox and CSV export, career application inbox/status management, campaign banners with hosted media URLs, and shared SEO drafts/export.
- `bi-live-config.js` — public Supabase URL/key placeholders. Use only the publishable/anon key here; never use a service-role key.
- `bi-live-sync.js` — page-view, enquiry and banner integration adapted to the original website markup.
- `supabase-live-sync.sql` — database tables, RLS policies and Realtime setup.
- `api/enquiry-notification.js` — Vercel serverless email notification endpoint using Resend; secrets stay in server environment variables.
- `LIVE-SYNC-SETUP.md` — Supabase, Vercel, Resend, careers and campaign-media setup instructions.

## Important status
The site and admin UI can be opened without a build step, but shared cloud features do not work until Supabase is configured and the SQL is run. The existing enquiry still opens WhatsApp; when configured, it also saves a copy to the shared admin inbox before opening WhatsApp. SEO entries are shared drafts only and do not automatically rewrite or redeploy HTML. Email notification code is included but requires Vercel + Resend configuration and end-to-end testing. Campaign media can be shown from a hosted HTTPS URL; direct local-file upload is not included. SEO entries remain drafts and do not auto-deploy.

Upload the complete folder to the existing static host, then complete the Supabase setup in `LIVE-SYNC-SETUP.md`. Test admin login, enquiry submission, banner publication and updates from a second browser/device before relying on live sync.

Email: `infotechsbharat@gmail.com`. The public site retains its existing phone/WhatsApp destinations and contact flow.

## Integrations added in this development pass
- Enquiry notification endpoint for Vercel + Resend (`api/enquiry-notification.js`).
- Career application form and authenticated admin application/status management.
- Campaign image/video display from a hosted HTTPS URL.

These require the updated Supabase SQL and Vercel/Resend configuration described in `LIVE-SYNC-SETUP.md`. No real credentials are bundled.
