// Language selection for the LightCheck legal pages.
// Order of preference: ?lang= in the URL, the viewer's last choice, the
// browser language. Unsupported languages fall back to English, matching
// the app.
(function () {
  var LANGS = ['zh-Hant', 'zh-Hans', 'en', 'ja'];
  var KEY = 'lightcheck-legal-lang';
  var root = document.documentElement;

  function normalize(value) {
    if (!value) return null;
    var v = String(value).toLowerCase();
    if (v.indexOf('ja') === 0) return 'ja';
    if (v.indexOf('en') === 0) return 'en';
    if (v.indexOf('zh') === 0) {
      if (/hans|-cn|-sg|-my/.test(v)) return 'zh-Hans';
      return 'zh-Hant';
    }
    return null;
  }

  function fromUrl() {
    try {
      return normalize(new URLSearchParams(location.search).get('lang'));
    } catch (e) {
      return null;
    }
  }

  function fromStorage() {
    try {
      return normalize(localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }

  function fromBrowser() {
    var list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];
    for (var i = 0; i < list.length; i++) {
      var lang = normalize(list[i]);
      if (lang) return lang;
    }
    return 'en';
  }

  function apply(lang, remember) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);

    var title = root.getAttribute('data-title-' + lang);
    if (title) document.title = title;

    var buttons = document.querySelectorAll('.langs button');
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-set') === lang;
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    // Keep the chosen language when moving between the pages.
    var links = document.querySelectorAll('a[data-page]');
    for (var j = 0; j < links.length; j++) {
      links[j].setAttribute('href', links[j].getAttribute('data-page') + '?lang=' + lang);
    }

    if (remember) {
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      try {
        var url = new URL(location.href);
        url.searchParams.set('lang', lang);
        history.replaceState(null, '', url);
      } catch (e) {}
    }
  }

  apply(fromUrl() || fromStorage() || fromBrowser(), false);

  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('.langs button');
    if (!button) return;
    var lang = button.getAttribute('data-set');
    if (LANGS.indexOf(lang) !== -1) apply(lang, true);
  });
})();
