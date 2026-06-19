(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterType = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function applyFilters() {
    var keyword = normalize(filterInput && filterInput.value);
    var year = filterYear && filterYear.value;
    var region = filterRegion && filterRegion.value;
    var type = filterType && filterType.value;

    cards.forEach(function (card) {
      var title = normalize(card.getAttribute('data-title'));
      var cardYear = card.getAttribute('data-year');
      var cardRegion = card.getAttribute('data-region');
      var cardType = card.getAttribute('data-type');
      var matched = true;

      if (keyword && title.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
    });
  }

  [filterInput, filterYear, filterRegion, filterType].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  var playButton = document.querySelector('[data-play-button]');
  var player = document.querySelector('[data-player]');
  var playerStatus = document.querySelector('[data-player-status]');

  function setPlayerStatus(message) {
    if (playerStatus) {
      playerStatus.textContent = message;
    }
  }

  if (playButton && player) {
    playButton.addEventListener('click', function () {
      var source = playButton.getAttribute('data-video-url');

      if (!source) {
        setPlayerStatus('当前影片数据未提供播放源；播放器结构与 HLS 初始化逻辑已保留，可在合法 m3u8 地址写入后直接播放。');
        return;
      }

      if (source.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(player);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          player.play();
          setPlayerStatus('正在播放。');
        });
        return;
      }

      player.src = source;
      player.play();
      setPlayerStatus('正在播放。');
    });
  }
}());
