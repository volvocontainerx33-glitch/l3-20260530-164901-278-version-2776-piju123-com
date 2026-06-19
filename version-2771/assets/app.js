(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = queryAll('[data-hero-slide]', hero);
    var dots = queryAll('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    queryAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var year = scope.querySelector('[data-year-filter]');
      var region = scope.querySelector('[data-region-filter]');
      var list = scope.parentElement.querySelector('[data-movie-list]');
      if (!list) {
        return;
      }
      var cards = queryAll('[data-movie-card]', list);

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var regionValue = region ? region.value : '';
        cards.forEach(function (card) {
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardRegion = card.getAttribute('data-region') || '';
          var matchText = !text || title.indexOf(text) !== -1;
          var matchYear = !yearValue || cardYear === yearValue;
          var matchRegion = !regionValue || cardRegion === regionValue;
          card.style.display = matchText && matchYear && matchRegion ? '' : 'none';
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (region) {
        region.addEventListener('change', apply);
      }
    });
  }

  window.setupMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var hls = null;
    var ready = false;

    if (!video || !button || !options.url) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(options.url);
        hls.attachMedia(video);
      } else {
        video.src = options.url;
      }
    }

    function start() {
      prepare();
      button.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
