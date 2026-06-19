(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-card-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search]');
      var select = scope.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      function apply() {
        var query = normalize(input ? input.value : '');
        var year = select ? select.value : '';
        cards.forEach(function (card) {
          var content = normalize(card.getAttribute('data-keywords'));
          var cardYear = card.getAttribute('data-year') || '';
          var matchQuery = !query || content.indexOf(query) !== -1;
          var matchYear = !year || cardYear === year;
          card.style.display = matchQuery && matchYear ? '' : 'none';
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-start');
      var stream = shell.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;
      function start() {
        if (started || !video || !stream) {
          return;
        }
        started = true;
        shell.classList.add('is-playing');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.src = stream;
        video.play().catch(function () {});
      }
      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started) {
            start();
          }
        });
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        window.addEventListener('pagehide', function () {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
