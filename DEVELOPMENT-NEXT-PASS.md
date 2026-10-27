# Development next pass

## Added
- Vercel email notification endpoint using Resend (`api/enquiry-notification.js`).
- Enquiry form reports Supabase inbox and email outcomes separately and preserves the WhatsApp handoff.
- Campaign banners support a hosted HTTPS image/video URL.
- Careers page has a direct application form and the SQL adds a shared career applications table.
- Admin has a Career applications tab to review applications and update their status.
- Realtime subscription for career application updates.
- Setup guide covers Vercel environment variables, Resend, Supabase and media hosting.

## Requires external configuration and verification
- Supabase URL/key, running the complete SQL, and adding the real admin Auth UUID.
- Vercel deployment and Resend sender verification/environment variables.
- Real end-to-end testing for email, career application submission, admin status updates and media display.
- SEO changes are shared drafts; they do not automatically update static HTML or deploy.
- Resume/portfolio are public URLs, not file uploads.
- WhatsApp remains a user-initiated `wa.me` handoff, not the Meta WhatsApp Business API. A real WhatsApp API integration needs Meta business/app credentials and webhook configuration.
- No CAPTCHA/rate-limit provider is wired in; add one before public paid traffic.
