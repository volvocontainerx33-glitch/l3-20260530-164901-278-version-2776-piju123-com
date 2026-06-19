import { H as Hls } from './video-player-dru42stk.js';

const menuButton = document.querySelector('[data-menu-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (menuButton && mobilePanel) {
  menuButton.addEventListener('click', () => {
    mobilePanel.classList.toggle('is-open');
  });
}

function initHeroSlider() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length <= 1) return;

  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));

  const setActive = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => setActive(index));
  });

  window.setInterval(() => setActive(activeIndex + 1), 5200);
}

function initPlayers() {
  const videos = Array.from(document.querySelectorAll('video.hls-video'));

  videos.forEach((video) => {
    const source = video.dataset.src;
    const overlay = video.closest('.video-shell')?.querySelector('.play-overlay');
    if (!source) return;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }

    const play = () => {
      overlay?.classList.add('is-hidden');
      video.play().catch(() => {
        overlay?.classList.remove('is-hidden');
      });
    };

    overlay?.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      } else {
        video.pause();
        overlay?.classList.remove('is-hidden');
      }
    });
    video.addEventListener('play', () => overlay?.classList.add('is-hidden'));
    video.addEventListener('pause', () => overlay?.classList.remove('is-hidden'));
  });
}

function movieCard(movie, prefix = '') {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `
    <article class="movie-card">
      <a class="poster-box" href="${prefix}movies/${movie.file}" aria-label="观看 ${escapeHtml(movie.title)}">
        <img src="${prefix}${movie.cover}.jpg" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.closest('.poster-box') && this.closest('.poster-box').classList.add('missing-poster'); this.style.opacity='0';">
        <span class="poster-play">立即观看</span>
      </a>
      <div class="movie-info">
        <div class="movie-meta-row">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="${prefix}movies/${movie.file}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}

function escapeHtml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initSearchPage() {
  const mount = document.querySelector('[data-search-results]');
  if (!mount || !window.MOVIE_SEARCH_INDEX) return;

  const params = new URLSearchParams(window.location.search);
  const keyword = (params.get('q') || '').trim().toLowerCase();
  const title = document.querySelector('[data-search-title]');
  if (title) {
    title.textContent = keyword ? `“${params.get('q')}” 的搜索结果` : '影片搜索';
  }

  if (!keyword) {
    mount.innerHTML = '<div class="empty-state">请输入影片名、地区、类型、年份或标签进行搜索。</div>';
    return;
  }

  const results = window.MOVIE_SEARCH_INDEX
    .filter((movie) => {
      const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine]
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    })
    .slice(0, 100);

  if (results.length === 0) {
    mount.innerHTML = '<div class="empty-state">没有找到匹配影片，可以尝试更短的关键词。</div>';
    return;
  }

  mount.innerHTML = `<div class="movie-grid">${results.map((movie) => movieCard(movie)).join('')}</div>`;
}

initHeroSlider();
initPlayers();
initSearchPage();
