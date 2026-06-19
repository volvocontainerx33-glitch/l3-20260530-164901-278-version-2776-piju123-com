function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function initMenu() {
  const button = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
  });
}

function initHero() {
  const root = document.querySelector("[data-hero]");
  if (!root) {
    return;
  }
  const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
  const prev = root.querySelector("[data-hero-prev]");
  const next = root.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      restart();
    });
  }

  if (slides.length > 1) {
    restart();
  }
}

function initFilters() {
  const inputs = Array.from(document.querySelectorAll("[data-filter-input]"));
  inputs.forEach(function (input) {
    const section = input.closest("section");
    const list = document.querySelector("[data-filter-list]");
    const empty = document.querySelector("[data-filter-empty]");
    if (!list) {
      return;
    }

    input.addEventListener("input", function () {
      const query = input.value.trim().toLowerCase();
      const items = Array.from(list.children);
      let visible = 0;
      items.forEach(function (item) {
        const text = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
        const matched = !query || text.indexOf(query) !== -1;
        item.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
      if (section) {
        section.setAttribute("data-visible", String(visible));
      }
    });
  });
}

function createResultCard(item) {
  const card = document.createElement("article");
  card.className = "movie-card";
  card.setAttribute("data-search", [item.title, item.year, item.region, item.genre, item.tags, item.category].join(" "));
  card.innerHTML = [
    '<a href="' + item.link + '" class="movie-card-link">',
    '<span class="poster-wrap">',
    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
    '<span class="poster-shade"></span>',
    '<span class="poster-badge">' + escapeHtml(item.category) + '</span>',
    '</span>',
    '<span class="card-content">',
    '<span class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</span>',
    '<h3>' + escapeHtml(item.title) + '</h3>',
    '<p>' + escapeHtml(item.oneLine) + '</p>',
    '<span class="card-tags"><span>' + escapeHtml(item.genre) + '</span></span>',
    '</span>',
    '</a>'
  ].join("");
  return card;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initSearchPage() {
  const results = document.querySelector("[data-search-results]");
  const status = document.querySelector("[data-search-status]");
  const input = document.querySelector("[data-search-page-input]");
  if (!results || !status || !window.SITE_SEARCH_INDEX) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  if (input) {
    input.value = query;
  }
  if (!query) {
    status.textContent = "输入关键词即可搜索影片。";
    window.SITE_SEARCH_INDEX.slice(0, 24).forEach(function (item) {
      results.appendChild(createResultCard(item));
    });
    return;
  }
  const lower = query.toLowerCase();
  const matched = window.SITE_SEARCH_INDEX.filter(function (item) {
    return [item.title, item.year, item.region, item.genre, item.tags, item.oneLine, item.category]
      .join(" ")
      .toLowerCase()
      .indexOf(lower) !== -1;
  });
  status.textContent = matched.length ? "搜索结果：" + query : "未找到相关影片。";
  matched.slice(0, 240).forEach(function (item) {
    results.appendChild(createResultCard(item));
  });
}

function initMoviePlayer(url) {
  const video = document.querySelector("[data-player-video]");
  const overlay = document.querySelector("[data-player-start]");
  if (!video || !url) {
    return;
  }
  let prepared = false;
  let hls = null;

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function start() {
    prepare();
    video.controls = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    const playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (!prepared || video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

ready(function () {
  initMenu();
  initHero();
  initFilters();
  initSearchPage();
});
