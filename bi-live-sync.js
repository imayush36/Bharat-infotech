/* Bharat Infotechs shared live sync. Configure bi-live-config.js and Supabase before expecting cloud sync. */
(function () {
  'use strict';
  const cfg = window.BI_LIVE_CONFIG || {};
  const configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && !String(cfg.supabaseUrl).includes('YOUR-PROJECT') && !String(cfg.supabaseAnonKey).includes('YOUR_'));
  let clientPromise;
  function getClient() {
    if (!configured) return Promise.resolve(null);
    if (!clientPromise) clientPromise = new Promise((resolve, reject) => {
      function create() {
        if (!window.supabase) return reject(new Error('Supabase SDK unavailable'));
        resolve(window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } }));
      }
      if (window.supabase) create();
      else { const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'; script.onload = create; script.onerror = () => reject(new Error('Could not load Supabase SDK')); document.head.appendChild(script); }
    });
    return clientPromise;
  }
  const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
  async function recordVisit() {
    if (!configured) return { synced: false, reason: 'not-configured' };
    try { const sb = await getClient(); let sid = sessionStorage.getItem('bi_live_session'); if (!sid) { sid = window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2); sessionStorage.setItem('bi_live_session', sid); } const { error } = await sb.from('page_visits').insert({ page: clip(location.pathname, 500), session_id: clip(sid, 100) }); if (error) throw error; return { synced: true }; }
    catch (error) { console.warn('[Bharat Infotechs] Page view sync failed:', error.message); return { synced: false, reason: error.message }; }
  }
  async function recordEnquiry(data) {
    if (!configured) return { synced: false, reason: 'not-configured' };
    try { const sb = await getClient(); const { error } = await sb.from('enquiries').insert({ name: clip(data.name, 100), email: clip(data.email, 160) || null, service: clip(data.service, 160), message: clip(data.message, 2000) || null, page_url: clip(data.page || location.href, 1000) }); if (error) throw error; return { synced: true }; }
    catch (error) { console.warn('[Bharat Infotechs] Enquiry sync failed:', error.message); return { synced: false, reason: error.message }; }
  }
  async function getEnabledBanner() {
    if (!configured) return null;
    try { const sb = await getClient(); const { data, error } = await sb.from('marketing_banners').select('id,message,target_url,media_url,enabled,updated_at').eq('enabled', true).order('updated_at', { ascending: false }).limit(1).maybeSingle(); if (error) throw error; return data || null; }
    catch (error) { console.warn('[Bharat Infotechs] Banner sync failed:', error.message); return null; }
  }
  function renderBanner(b) {
    if (!b || !b.enabled || !b.message || document.getElementById('bi-promo-banner')) return;
    const bar = document.createElement('div'); bar.id = 'bi-promo-banner'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Bharat Infotechs announcement');
    Object.assign(bar.style, { position: 'relative', zIndex: '999', textAlign: 'center', padding: '11px 48px 11px 16px', background: 'linear-gradient(90deg,#ffb020,#29d9c5)', color: '#101014', font: '600 13px system-ui,sans-serif' });
    if (b.media_url && /^https:\/\//i.test(b.media_url)) {
      const media = document.createElement('div');
      media.style.cssText = 'margin:0 auto 8px;max-width:960px';
      if (/\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(b.media_url)) {
        const video = document.createElement('video'); video.src=b.media_url; video.controls=true; video.playsInline=true; video.preload='metadata';
        video.style.cssText='display:block;width:100%;max-height:260px;object-fit:contain;border-radius:8px'; media.appendChild(video);
      } else if (/\.(png|jpe?g|webp|gif|avif)(?:[?#].*)?$/i.test(b.media_url)) {
        const image=document.createElement('img'); image.src=b.media_url; image.alt='Bharat Infotechs campaign'; image.loading='lazy';
        image.style.cssText='display:block;max-width:100%;max-height:220px;margin:auto;border-radius:8px'; media.appendChild(image);
      }
      if(media.childNodes.length) bar.appendChild(media);
    }
    const message = document.createElement('span'); message.textContent = b.message; bar.appendChild(message);
    if (b.target_url) { const link = document.createElement('a'); link.href = b.target_url; link.textContent = ' Learn more'; link.style.cssText = 'font-weight:800;text-decoration:underline;margin-left:8px;color:inherit'; if (/^https:\/\//i.test(b.target_url)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; } bar.appendChild(link); }
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', 'Dismiss announcement'); close.style.cssText = 'position:absolute;right:12px;top:6px;border:0;background:#0001;border-radius:50%;width:27px;height:27px;cursor:pointer;font-size:18px'; close.addEventListener('click', () => bar.remove()); bar.appendChild(close); document.body.prepend(bar);
  }
  window.BILive = { configured, getClient, recordVisit, recordEnquiry, getEnabledBanner };
  if (!location.pathname.endsWith('/admin.html') && !location.pathname.endsWith('admin.html')) { recordVisit(); getEnabledBanner().then(renderBanner); }
})();
