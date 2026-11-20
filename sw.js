const CACHE = 'kurd-weather-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // فۆنتی Vazirmatn: لە کاشدا دەمێنێتەوە بۆ ئەوەی دواتر بێ ئینتەرنێتیش کار بکات
  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.open(CACHE).then(c => c.match(e.request).then(hit => {
        const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => hit);
        return hit || net;
      }))
    );
    return;
  }

  // API ی کەشوهەوا و گەڕان: هەرگیز کاش ناکرێت
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
