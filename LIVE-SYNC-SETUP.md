# Bharat Infotechs live sync setup

This site remains static-host compatible. Shared live data uses Supabase (database + Auth + Realtime). It is **not live until you configure and deploy it**.

## 1. Create a Supabase project
1. Create a project at https://supabase.com/.
2. In Project Settings → API, copy the Project URL and publishable key (or legacy anon key). Never use the `service_role` key in browser files.
3. Edit `bi-live-config.js` and replace the two placeholders.

## 2. Create the tables and policies
Open Supabase → SQL Editor and run all of `supabase-live-sync.sql`. This creates tables, row-level security policies and Realtime subscriptions.

## 3. Create your admin login
1. Supabase → Authentication → Users → Add user. Create the admin email/password yourself.
2. Copy that user's UUID. In SQL Editor run (replace the UUID):

```sql
insert into public.admin_users (user_id) values ('PASTE-AUTH-USER-UUID-HERE') on conflict do nothing;
```

Only UUIDs listed in `public.admin_users` can read enquiries/visits or manage SEO and banners. Do not add ordinary users.

## 4. Deploy
Upload/deploy the whole website folder, including `bi-live-config.js`, `bi-live-sync.js`, and `supabase-live-sync.sql`, to your existing host. Then open `/admin.html`, sign in, and test from a second browser/device.

## Live features
- Page-view events from all public pages are inserted into the shared database. These are page views, not unique-user counts, and can include bots.
- Enquiry submissions are stored in the shared admin inbox, then the existing form opens WhatsApp for the visitor to send the message themselves.
- Admin-published marketing banners are shared and shown on all connected pages.
- SEO drafts sync between admins but do not automatically rewrite the website HTML or deploy changes. Export drafts and publish HTML changes through your deployment workflow.
- Admin dashboard uses Supabase Realtime for updates when connected; it also offers manual refresh.

## Production recommendations
Before paid campaigns, add CAPTCHA/rate limiting (e.g. Edge Function or server endpoint), a privacy notice/consent as appropriate, analytics bot filtering, backups, and an audit log. Keep database policies enabled. Never expose customer data through public SELECT policies.


## Email notifications (Vercel + Resend)

`api/enquiry-notification.js` is a Vercel serverless endpoint. It sends enquiry and career-application notification emails to `infotechsbharat@gmail.com` by default, but email delivery will remain unavailable until configured.

1. Deploy the complete website folder to Vercel. Keep the `api/` folder at the project root.
2. Set up Resend and verify the sender domain/address you plan to use.
3. In Vercel → Project Settings → Environment Variables, add:
   - `RESEND_API_KEY`: private Resend API key.
   - `ENQUIRY_FROM_EMAIL`: sender address verified by Resend.
   - `ENQUIRY_TO_EMAIL`: optional recipient override; default is `infotechsbharat@gmail.com`.
   - `ALLOWED_SITE_ORIGINS`: optional comma-separated exact origins, e.g. `https://www.your-domain.com,https://your-domain.com`.
4. Redeploy after saving environment variables.
5. Test both a website enquiry and a career application and verify email delivery. The page will explicitly say when email isn't confirmed.

Never place `RESEND_API_KEY` in any browser JavaScript or HTML file.

## Career applications

The careers page has a direct application form for name, email, phone, role, resume URL, portfolio URL, and note. Applications are stored in `public.career_applications` and visible in the authenticated admin's **Career applications** tab. Statuses can be changed there. Run the updated `supabase-live-sync.sql` in Supabase to create this table and its policies. Resume and portfolio values are links, not uploaded files.

## Campaign media

The admin's Marketing banners tab accepts a publicly accessible HTTPS image/video URL and can display common image formats or MP4/WebM/OGG videos. Upload the media to your hosting/storage provider first; this form does not upload local files. The SQL includes a safe `media_url` migration for existing databases.

## Customer enquiry popup: WhatsApp + email draft
The homepage enquiry panel opens automatically shortly after the page loads and can be dismissed with the close button, backdrop, or Escape. Customers can choose **Send via WhatsApp** (opens a prefilled WhatsApp message) or **Draft Email** (opens their configured email app with the recipient, subject, and complete message prefilled; the customer presses Send). The website also attempts to save the enquiry to the configured Supabase inbox and notify the business through the Vercel `/api/enquiry-notification` endpoint.

For server-side email notifications to the business, configure `RESEND_API_KEY` and `ENQUIRY_FROM_EMAIL` in Vercel; the sender must be verified with Resend. `ENQUIRY_TO_EMAIL` is optional and defaults to `infotechsbharat@gmail.com`. These secrets must never be placed in browser JavaScript. WhatsApp opens the user's WhatsApp app/site; this is click-to-send and does not send messages automatically through the WhatsApp Business API.

