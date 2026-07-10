/* DIGIDIORAMA Teacher Planner — service worker (stale-while-revalidate) */
var CACHE = 'dd-planner-v1';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil((async function(){
    var keys = await caches.keys();
    await Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // jangan cache panggilan API Supabase (harus selalu online)
  if (/supabase\.co/.test(url.hostname)) return;
  e.respondWith((async function(){
    var cache = await caches.open(CACHE);
    var cached = await cache.match(req);
    var net = fetch(req).then(function(r){
      if (r && r.status === 200 && (r.type === 'basic' || r.type === 'cors')) { try { cache.put(req, r.clone()); } catch(e){} }
      return r;
    }).catch(function(){ return cached; });
    return cached || net;
  })());
});
