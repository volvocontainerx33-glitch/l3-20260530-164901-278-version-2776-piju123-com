(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
      document.body.classList.toggle('is-locked', !expanded);
    });
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
  }

  function filterCards(scope, value) {
    var term = normalize(value);
    var cards = scope.querySelectorAll('.movie-card');
    cards.forEach(function (card) {
      var target = normalize(card.getAttribute('data-search'));
      card.classList.toggle('is-hidden', term && target.indexOf(term) === -1);
    });
  }

  var searchArea = document.querySelector('[data-search-area]');
  var globalInput = document.querySelector('.global-search-input');
  if (searchArea && globalInput) {
    var initial = getQueryParam('q');
    globalInput.value = initial;
    filterCards(searchArea, initial);
    globalInput.addEventListener('input', function () {
      filterCards(searchArea, globalInput.value);
    });
  }

  var filterArea = document.querySelector('[data-filter-area]');
  var localInput = document.querySelector('.local-filter');
  if (filterArea && localInput) {
    localInput.addEventListener('input', function () {
      filterCards(filterArea, localInput.value);
    });

    document.querySelectorAll('[data-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('[data-filter]').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        localInput.value = button.getAttribute('data-filter') || '';
        filterCards(filterArea, localInput.value);
      });
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector('.movie-video');
    var cover = document.querySelector('.player-cover');
    var trigger = document.querySelector('.player-trigger');
    var attached = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function attachMedia() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    }

    function startPlayback() {
      attachMedia();
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
