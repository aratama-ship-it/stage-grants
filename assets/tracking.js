// Cookie同意バナー＋アクセス解析/広告の同意ゲート。
// window.__SITE_TRACKING = { ga4, adsClient, privacyUrl } を各ページのheadで設定する。
// ga4/adsClient のどちらも空なら何も読み込まず、バナーも出さない（サイトはクリーンなまま）。
(function () {
  var cfg = window.__SITE_TRACKING || {};
  var enabled = !!(cfg.ga4 || cfg.adsClient);
  if (!enabled) return;
  var KEY = 'cc-consent-v1';

  function loadTrackers() {
    if (cfg.ga4) {
      var g = document.createElement('script');
      g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + cfg.ga4;
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', cfg.ga4, { anonymize_ip: true });
    }
    if (cfg.adsClient) {
      var a = document.createElement('script');
      a.async = true;
      a.crossOrigin = 'anonymous';
      a.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + cfg.adsClient;
      document.head.appendChild(a);
    }
  }

  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice === 'accept') { loadTrackers(); return; }
  if (choice === 'reject') { return; }

  function decide(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    if (v === 'accept') loadTrackers();
  }

  var bar = document.createElement('div');
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Cookieの同意');
  bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1c1c22;color:#fff;padding:14px 16px;font-size:13px;line-height:1.6;display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,\'Hiragino Sans\',\'Noto Sans JP\',sans-serif';
  var msg = document.createElement('span');
  msg.style.cssText = 'max-width:640px';
  msg.innerHTML = '本サイトはアクセス解析' + (cfg.adsClient ? '・広告配信' : '') + 'のためにCookie等を使用する場合があります。同意しない場合、これらは読み込まれません。 <a href="' + (cfg.privacyUrl || 'privacy.html') + '" style="color:#9db4ff">詳細</a>';
  var acc = document.createElement('button');
  acc.textContent = '同意する';
  acc.style.cssText = 'background:#3355e0;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-weight:700;cursor:pointer;font-family:inherit';
  var rej = document.createElement('button');
  rej.textContent = '拒否';
  rej.style.cssText = 'background:transparent;color:#fff;border:1px solid #555;border-radius:8px;padding:8px 14px;cursor:pointer;font-family:inherit';
  acc.onclick = function () { decide('accept'); };
  rej.onclick = function () { decide('reject'); };
  bar.appendChild(msg);
  bar.appendChild(acc);
  bar.appendChild(rej);
  (document.body || document.documentElement).appendChild(bar);
})();
