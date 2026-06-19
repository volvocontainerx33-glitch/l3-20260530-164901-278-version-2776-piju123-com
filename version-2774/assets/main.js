(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobilePanel.hidden = open;
    });
  }

  function runHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    if (slides.length === 0) {
      return;
    }

    function activate(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        schedule();
      });
    }

    activate(0);
    schedule();
  }

  function applySearchFilter() {
    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

    filterForms.forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var scopeSelector = form.getAttribute('data-filter-scope') || 'body';
      var scope = document.querySelector(scopeSelector) || document.body;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var empty = scope.querySelector('.empty-state');

      function filter(value) {
        var keyword = String(value || '').trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || card.textContent.toLowerCase();
          var matched = keyword === '' || text.indexOf(keyword) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          scope.classList.toggle('no-results', visible === 0);
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filter(input ? input.value : '');
      });

      if (input) {
        input.addEventListener('input', function () {
          filter(input.value);
        });
      }

      if (document.body.classList.contains('search-page') && input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
          input.value = query;
          filter(query);
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    runHero();
    applySearchFilter();
  });
})();
