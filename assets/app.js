(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navigation = document.querySelector('.site-nav');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', function () {
            var isOpen = navigation.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        var keywordInput = searchPage.querySelector('[data-filter-keyword]');
        var yearSelect = searchPage.querySelector('[data-filter-year]');
        var regionSelect = searchPage.querySelector('[data-filter-region]');
        var resetButton = searchPage.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll('.movie-card'));
        var query = new URLSearchParams(window.location.search).get('q');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function runFilter() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var region = normalize(regionSelect && regionSelect.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
                card.hidden = !(matchKeyword && matchYear && matchRegion);
            });
        }

        if (keywordInput && query) {
            keywordInput.value = query;
        }

        [keywordInput, yearSelect, regionSelect].forEach(function (item) {
            if (item) {
                item.addEventListener('input', runFilter);
                item.addEventListener('change', runFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                runFilter();
            });
        }

        runFilter();
    }
})();
