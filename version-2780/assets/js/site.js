(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartTimer();
      });
    });

    restartTimer();
  }

  var searchInput = document.querySelector('.js-search');
  var yearFilter = document.querySelector('.js-year-filter');
  var typeFilter = document.querySelector('.js-type-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function matchesYear(cardYear, selectedYear) {
    if (!selectedYear) {
      return true;
    }
    var numericYear = parseInt(cardYear, 10);
    var selected = parseInt(selectedYear, 10);
    if (selected === 1990) {
      return numericYear >= 1990 && numericYear < 2000;
    }
    if (selected === 1980) {
      return numericYear > 0 && numericYear < 1990;
    }
    return numericYear === selected;
  }

  function filterCards() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var selectedYear = yearFilter ? yearFilter.value : '';
    var selectedType = normalize(typeFilter ? typeFilter.value : '');

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.tags
      ].join(' '));
      var cardYear = card.dataset.year || '';
      var cardType = normalize(card.dataset.type || '');
      var visible = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        visible = false;
      }
      if (!matchesYear(cardYear, selectedYear)) {
        visible = false;
      }
      if (selectedType && cardType.indexOf(selectedType) === -1) {
        visible = false;
      }

      card.classList.toggle('is-hidden', !visible);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', filterCards);
  }

  var playButton = document.querySelector('[data-play-button]');
  if (playButton) {
    playButton.addEventListener('click', function () {
      var video = document.querySelector('.site-player');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-src');
      if (!source) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }
        var hls = new window.Hls();
        video._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    });
  }
})();
